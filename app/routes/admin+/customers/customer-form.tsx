import { Form } from "@remix-run/react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/ui/components/card.tsx";
import { Input } from "~/ui/components/input.tsx";
import { Label } from "~/ui/components/label.tsx";
import { Textarea } from "~/ui/components/textarea.tsx";

export type CustomerFormsError = {
  name?: string | string[] | null;
  email?: string | string[] | null;
  note?: string | string[] | null;
};

export type CustomerFormProps = {
  name?: string;
  email?: string;
  note?: string;
  formId?: string;
  errors?: CustomerFormsError;
  mediaLibrary?: React.ReactNode;
};

export const CustomerForm = ({
  name,
  email,
  errors,
  note,
  formId,
  mediaLibrary,
}: CustomerFormProps) => {
  return (
    <>
      <Form
        className="mt-16 flex flex-col justify-start gap-16 lg:flex-row"
        method="post"
        id={formId}
        encType="multipart/form-data"
      >
        <div className="flex flex-col gap-6 lg:basis-96">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={name || undefined}
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
              defaultValue={email}
              type="email"
              required={true}
            />
            {errors && errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" name="note" defaultValue={note} />
            {errors && errors.note && (
              <p className="text-sm text-red-600">{errors.note}</p>
            )}
          </div>
        </div>
        {name && (
          <Card className="lg:basis-96">
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">No subscription</CardContent>
          </Card>
        )}
      </Form>
    </>
  );
};
