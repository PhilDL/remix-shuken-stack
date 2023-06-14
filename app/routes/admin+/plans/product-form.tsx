import { useState } from "react";
import { Form } from "@remix-run/react";

import { Input } from "~/ui/components/input.tsx";
import { Label } from "~/ui/components/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/components/select.tsx";
import { Switch } from "~/ui/components/switch.tsx";
import { Textarea } from "~/ui/components/textarea.tsx";

export type ProductFormsError = {
  name?: string | string[] | null;
  description?: string | string[] | null;
  monthly?: string[] | boolean | null;
  yearly?: string[] | boolean | null;
  monthlyPrice?: number | string[] | null;
  yearlyPrice?: number | string[] | null;
};

export type ProductFormProps = {
  name?: string;
  description?: string;
  monthly?: boolean;
  yearly?: boolean;
  monthlyPrice?: boolean;
  yearlyPrice?: boolean;
  formId?: string;
  errors?: ProductFormsError;
  mediaLibrary?: React.ReactNode;
};

export const ProductForm = ({
  name,
  description,
  yearly,
  monthly,
  monthlyPrice,
  yearlyPrice,
  errors,
  formId,
  mediaLibrary,
}: ProductFormProps) => {
  const [monthlyChecked, setMonthlyChecked] = useState(monthly);
  const [yearlyChecked, setYearlyChecked] = useState(yearly);
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={description}
            />
            {errors && errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>
          <div className="flex w-full max-w-sm items-center gap-1.5">
            <Switch
              id="monthly"
              name="monthly"
              checked={monthly}
              onCheckedChange={setMonthlyChecked}
            />
            {errors && errors.monthly && (
              <p className="text-sm text-red-600">{errors.monthly}</p>
            )}
            <Label htmlFor="monthly">Monthly Price</Label>
          </div>
          {monthlyChecked && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="monthlyPrice">Amount</Label>
              <div className="flex flex-row gap-2">
                <Input
                  id="monthlyPrice"
                  name="monthlyPrice"
                  type="number"
                  step="0.01"
                  placeholder="1.00"
                  defaultValue={String(monthlyPrice) || "0"}
                />
                <Select name="monthlyCurrency" defaultValue={"eur"}>
                  <SelectTrigger className="inline-flex" form={formId}>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"eur"}>EUR</SelectItem>
                    <SelectItem value={"usd"}>USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors && errors.monthlyPrice && (
                <p className="text-sm text-red-600">{errors.monthlyPrice}</p>
              )}
            </div>
          )}
          <div className="flex w-full max-w-sm items-center gap-1.5">
            <Switch
              id="yearly"
              name="yearly"
              checked={yearly}
              onCheckedChange={setYearlyChecked}
            />
            {errors && errors.yearly && (
              <p className="text-sm text-red-600">{errors.yearly}</p>
            )}
            <Label htmlFor="yearly">Yearly Price</Label>
          </div>
          {yearlyChecked && (
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="yearlyPrice">Amount</Label>
              <div className="flex flex-row gap-2">
                <Input
                  id="yearlyPrice"
                  name="yearlyPrice"
                  type="number"
                  step="0.01"
                  placeholder="1.00"
                  defaultValue={String(yearlyPrice) || "0"}
                />
                <Select name="yearlyCurrency" defaultValue={"eur"}>
                  <SelectTrigger className="inline-flex" form={formId}>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"eur"}>EUR</SelectItem>
                    <SelectItem value={"usd"}>USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {errors && errors.yearlyPrice && (
                <p className="text-sm text-red-600">{errors.yearlyPrice}</p>
              )}
            </div>
          )}
        </div>
      </Form>
    </>
  );
};
