import { mailOptions, transporter } from "@/configEmail/nodemailer";
import { render } from "@react-email/render";
import { Email } from "@/configEmail/emailSkinCancel";

const handler = async (req, res) => {
  if (req.method === "POST") {
    const data = req.body;
    const dataUpperCase = data.name.toUpperCase();
    const convertDate = data.convertDate;
    const nameOfGuestUpperCase = data.dataNameOfGuest.toUpperCase();
    const emailHtml = render(
      <Email
        dataUpperCase={dataUpperCase}
        convertDate={convertDate}
        nameOfGuestUpperCase={nameOfGuestUpperCase}
      />
    );
    if (!data) {
      return res.status(400).json({ message: "Bad request" });
    }
    try {
      await transporter.sendMail({
        ...mailOptions,
        subject: `ANULACJA TRANSFERU OD ${dataUpperCase} NA ${data.convertDate}`,
        text: "",
        // html: `<p><strong>${dataUpperCase}</strong> anulował transfer na termin <strong>${data.convertDate}</strong> dla <strong>${nameOfGuestUpperCase}</strong> ! Sprawdź w aplikacji: https://airportgr8way.vercel.app/</p>`,
        html: emailHtml,
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: error.message });
    }
  }

  return res.status(400).json({ message: "Bad request" });
};

export default handler;
