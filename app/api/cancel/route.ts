import { NextRequest, NextResponse } from "next/server";
import { mailOptions, transporter } from "@/configEmail/nodemailer";
import { render } from "@react-email/render";
import { Email } from "@/configEmail/emailSkinCancel";
import React from "react";

export const POST = async (req: NextRequest) => {
  if (req.method === "POST") {
    const body = await req.json();
    const data = body;
    if (!data) {
      return NextResponse.json({ message: "Bad request" });
    }

    try {
      const { name, convertDate, dataNameOfGuest } = data as {
        name?: string;
        convertDate?: string;
        dataNameOfGuest?: string;
      };

      if (!name || !convertDate || !dataNameOfGuest) {
        return NextResponse.json({ message: "Brak danych" });
      }

      const dataUpperCase = name.toUpperCase();
      const nameOfGuestUpperCase = dataNameOfGuest.toUpperCase();

      const emailHtml = render(
        React.createElement(Email, {
          dataUpperCase,
          convertDate,
          nameOfGuestUpperCase,
        }),
      );

      await transporter.sendMail({
        ...mailOptions,
        subject: `ANULACJA TRANSFERU OD ${dataUpperCase} NA ${convertDate}`,
        text: "",
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
