import { Column } from "@react-email/column";
import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Heading } from "@react-email/heading";
import { Html } from "@react-email/html";
import { Img } from "@react-email/img";
import { Link } from "@react-email/link";
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";

interface SignUpEmailProps {
  appName?: string;
  magicLink?: string;
  loginCode?: string;
  accentColor?: string;
  logo?: string;
  name?: string;
  appDescription?: string;
}

export const SignUpEmail = ({
  appName = "Shuken - Remix stack",
  magicLink = "https://shuken.app",
  loginCode = "GV4FQG",
  accentColor = "#c61bb2",
  logo = "https://shuken.app/content/images/size/w300/2021/04/Coding-Dodo.png",
  name,
  appDescription = "Shuken is an all-in-one Remix app starter.",
}: SignUpEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to {appName}</Preview>
    <Tailwind>
      <Container className="margin-auto px-[12px]">
        <Heading className="my-12 font-sans text-2xl font-bold text-slate-950">
          Hey there!
        </Heading>
        <Text className="text-md my-7 font-sans text-slate-800">
          Welcome to {appName}
          {name && `, ${name}`}!
        </Text>
        <Text className="text-md my-7 font-sans text-slate-800">
          If you are on the same device, tap the link below to complete the
          signup process for {appName}, and be automatically signed in:
        </Text>
        <Section>
          <Column align="center">
            <Link
              href={magicLink}
              target="_blank"
              className="rounded-md px-6 py-3 font-sans text-xs font-bold text-white"
              style={{
                backgroundColor: accentColor,
              }}
            >
              Confirm signup
            </Link>
          </Column>
        </Section>

        <Text className="text-md my-7 font-sans text-slate-800">
          Or, copy and paste this temporary login code:
        </Text>
        <code
          style={{
            display: "inline-block",
            textAlign: "center" as const,
            padding: "16px 4.5%",
            width: "90.5%",
            backgroundColor: "#f4f4f4",
            borderRadius: "5px",
            border: "1px solid #eee",
            color: "#333",
            fontSize: "26px",
            fontWeight: "bold",
          }}
        >
          {loginCode}
        </code>
        <Text className="text-md my-4 font-sans text-slate-500">
          If you didn&apos;t try to login, you can safely ignore this email.
        </Text>
        <Img src={logo} height="32" alt={`${appName}'s logo`} />
        <Text className="my-4 font-sans text-xs text-slate-400">
          {appDescription}
        </Text>
      </Container>
    </Tailwind>
  </Html>
);

export default SignUpEmail;
