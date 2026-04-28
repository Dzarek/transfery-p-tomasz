import type { NextApiRequest, NextApiResponse } from "next";
import { mailOptions, transporter } from "@/configEmail/nodemailer";
import { render } from "@react-email/render";
import { Email } from "@/configEmail/emailSkin";
import React from "react";

type Data = { success: true } | { message: string };

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, convertDate } = req.body as {
      name?: string;
      convertDate?: string;
    };

    if (!name || !convertDate) {
      return res.status(400).json({ message: "Brak danych" });
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

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Błąd wysyłki maila",
    });
  }
};

export default handler;
