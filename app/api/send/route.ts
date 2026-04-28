import { NextRequest, NextResponse } from "next/server";
import { mailOptions, transporter } from "@/configEmail/nodemailer";
import { render } from "@react-email/render";
import { Email } from "@/configEmail/emailSkin";
import React from "react";

export const POST = async (req: NextRequest) => {
  if (req.method === "POST") {
    const body = await req.json();
    const data = body;

    if (!data) {
      return NextResponse.json({ message: "Bad request" });
    }

    try {
      const { name, convertDate } = data as {
        name?: string;
        convertDate?: string;
      };

      if (!name || !convertDate) {
        return NextResponse.json({ message: "Brak danych" });
      }

      const dataUpperCase = name.toUpperCase();

      const emailHtml = render(
        React.createElement(Email, {
          dataUpperCase,
          convertDate,
        }),
      );

      await transporter.sendMail({
        ...mailOptions,
        subject: `NOWY TRANSFER OD ${dataUpperCase}`,
        text: `Nowy transfer od ${dataUpperCase} w dniu ${convertDate}`,
        html: emailHtml,
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error(error);

      return NextResponse.json({ message: error });
    }
  }

  return NextResponse.json({ message: "Bad request" });
};
