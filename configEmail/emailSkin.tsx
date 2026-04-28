import { Body } from "@react-email/body";
import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Heading } from "@react-email/heading";
import { Html } from "@react-email/html";
import { Img } from "@react-email/img";
import { Link } from "@react-email/link";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import { Row } from "@react-email/row";

type EmailProps = {
  dataUpperCase: string;
  convertDate: string;
};

export const Email = ({ dataUpperCase, convertDate }: EmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Row style={header}>
          <Img
            style={imgHeader}
            width={340}
            src="https://yallaway.pl/images/car2.png"
          />
          <Heading style={headerContentTitle}>
            NOWY TRANSFER OD {dataUpperCase}
          </Heading>
        </Row>

        <Section style={content}>
          <Text style={paragraph}>
            <strong>{dataUpperCase}</strong> dodał nowy transfer w terminie{" "}
            <strong>{convertDate}</strong>. <br />
            Potwierdź zlecenie w aplikacji!
          </Text>

          <Section style={buttonContainer}>
            <Link style={button} href="https://yallaway.pl/">
              otwórz aplikację
            </Link>
          </Section>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
};

const header = {
  borderRadius: "5px 5px 0 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#222",
  width: "100%",
  padding: "0 20px",
} as const;
const imgHeader = {
  width: "100%",
};

const headerContentTitle = {
  color: "#fff",
  fontSize: "20px",
  fontWeight: "bold",
  lineHeight: "27px",
  marginTop: "30px",
  textAlign: "center",
  width: "100%",
} as const;

const paragraph = {
  fontSize: "15px",
  lineHeight: "21px",
  color: "#3c3f44",
};

const container = {
  width: "100%",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  border: "2px solid #222",
  borderRadius: "5px 5px 0 0",
};

const content = {
  padding: "30px 30px 40px 30px",
  maxWidth: "680px",
};

const buttonContainer = {
  margin: "0 auto",
  marginTop: "36px",
  display: "block",
  width: "100%",
};

const button = {
  backgroundColor: "#222",
  border: "1px solid #222",
  fontSize: "14px",
  lineHeight: "14px",
  padding: "13px 17px",
  borderRadius: "4px",
  maxWidth: "120px",
  color: "#fff",
  fontWeight: "600",
  margin: "0 auto",
};
