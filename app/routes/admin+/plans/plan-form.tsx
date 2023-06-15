import { Fragment, useState } from "react";
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
import type { ObjectEntries } from "~/types.ts";

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
  monthlyPrice?: number;
  yearlyPrice?: number;
  formId?: string;
  errors?: ProductFormsError;
  mediaLibrary?: React.ReactNode;
};

export type AvailableIntervals = "monthly" | "yearly";

export type IntervalsCheckbox = {
  [key in AvailableIntervals]: boolean;
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
  const [intervals, setIntervals] = useState<IntervalsCheckbox>({
    monthly: monthly || false,
    yearly: yearly || false,
  });
  const computePrice = (interval: AvailableIntervals) => {
    return interval === "monthly"
      ? monthlyPrice
      : interval === "yearly"
      ? yearlyPrice
      : 0;
  };

  return (
    <>
      <Form
        className="mt-4 flex flex-col justify-start gap-16 lg:flex-row"
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
          {(Object.entries(intervals) as ObjectEntries<IntervalsCheckbox>).map(
            ([interval, checked]) => (
              <Fragment key={interval}>
                <div className="flex w-full max-w-sm items-center gap-1.5">
                  <Switch
                    id={interval}
                    name={interval}
                    checked={checked}
                    onCheckedChange={(value) =>
                      setIntervals((prev) => ({ ...prev, [interval]: value }))
                    }
                  />
                  {errors && errors[interval] && (
                    <p className="text-sm text-red-600">{errors[interval]}</p>
                  )}
                  <Label htmlFor={interval}>{interval} Price</Label>
                </div>
                {checked && (
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor={`${interval}Price`}>Amount</Label>
                    <div className="flex flex-row gap-2">
                      <Input
                        id={`${interval}Price`}
                        name={`${interval}Price`}
                        type="number"
                        step="0.01"
                        placeholder="1.00"
                        defaultValue={String(computePrice(interval)) || "0"}
                      />
                      <Select name={`${interval}Currency`} defaultValue={"eur"}>
                        <SelectTrigger className="inline-flex" form={formId}>
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={"eur"}>EUR</SelectItem>
                          <SelectItem value={"usd"}>USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors &&
                      errors[
                        `${interval}Price` as `${typeof interval}Price`
                      ] && (
                        <p className="text-sm text-red-600">
                          {
                            errors[
                              `${interval}Price` as `${typeof interval}Price`
                            ]
                          }
                        </p>
                      )}
                  </div>
                )}
              </Fragment>
            )
          )}
        </div>
      </Form>
    </>
  );
};
