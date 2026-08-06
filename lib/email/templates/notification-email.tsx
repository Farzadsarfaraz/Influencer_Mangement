import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export function NotificationEmail({
  title,
  body,
  actionLabel,
  actionUrl,
}: {
  title: string;
  body?: string;
  actionLabel?: string;
  actionUrl?: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 12,
            padding: "32px",
            margin: "40px auto",
            maxWidth: 480,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: 600, color: "#4338ca" }}>
            Octagon
          </Text>
          <Heading style={{ fontSize: 20, margin: "8px 0 16px" }}>{title}</Heading>
          {body ? (
            <Text style={{ fontSize: 14, color: "#3f3f46", lineHeight: 1.6 }}>
              {body}
            </Text>
          ) : null}
          {actionUrl && actionLabel ? (
            <Section style={{ marginTop: 24 }}>
              <Button
                href={actionUrl}
                style={{
                  backgroundColor: "#4338ca",
                  color: "#ffffff",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {actionLabel}
              </Button>
            </Section>
          ) : null}
        </Container>
      </Body>
    </Html>
  );
}
