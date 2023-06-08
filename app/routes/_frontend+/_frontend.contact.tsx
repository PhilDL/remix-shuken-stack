import { Form, useActionData } from "@remix-run/react";
import { type ActionFunction } from "@remix-run/server-runtime";
import { errorMessagesForSchema, inputFromFormData } from "domain-functions";
import { AuthenticityTokenInput, verifyAuthenticityToken } from "remix-utils";

import { Button } from "~/ui/components/button.tsx";
import { Input } from "~/ui/components/input.tsx";
import { Label } from "~/ui/components/label.tsx";
import { Textarea } from "~/ui/components/textarea.tsx";
import {
  addFlashMessage,
  redirectWithFlashMessage,
} from "~/storage/flash-message.server.ts";
import { getSession } from "~/storage/session.server.ts";
import {
  contactFormHandler,
  inputContactForm,
} from "~/domain/frontend/contact-form-handler.server.ts";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.clone().formData();
  // CSRF Protection
  await verifyAuthenticityToken(formData, await getSession(request));

  const contactOperation = await contactFormHandler(
    inputFromFormData(formData)
  );
  if (!contactOperation.success) {
    return contactOperation;
  } else {
    const flash = await addFlashMessage(request, {
      type: "success",
      title: "Sent",
      message: "Your message has been sent.",
    });
    return redirectWithFlashMessage("/", flash);
  }
};

export default function Contact() {
  const data = useActionData<typeof action>();
  const errors = errorMessagesForSchema(
    data?.inputErrors ?? [],
    inputContactForm
  );

  return (
    <div className="container mx-auto mt-16 max-w-7xl flex-1">
      <h1 className="text-left text-3xl font-semibold text-primary">
        Contact Form
      </h1>
      <p className="text-muted-foreground">
        Here you can contact me. I will try to respond as soon as possible.
      </p>
      <Form className="my-8 grid gap-4 py-4" method="post" id={"contact"}>
        <AuthenticityTokenInput />
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            className="col-span-3"
            placeholder="Your name"
            required={true}
          />
          {errors && errors.name && (
            <p className="text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            className="col-span-3"
            required={true}
          />
          {errors && errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            name="message"
            className="col-span-3"
            required={true}
          />
          {errors && errors.message && (
            <p className="text-sm text-red-600">{errors.message}</p>
          )}
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Button type="submit" variant="default">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
}
