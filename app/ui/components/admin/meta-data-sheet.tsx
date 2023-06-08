import { useNavigation } from "@remix-run/react";
import { TowerControl } from "lucide-react";

import { Button } from "~/ui/components/button.tsx";
import { Input } from "~/ui/components/input.tsx";
import { Label } from "~/ui/components/label.tsx";
import { SaveButton } from "~/ui/components/save-button.tsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/ui/components/sheet.tsx";
import { Textarea } from "~/ui/components/textarea.tsx";

export type MetaDataSheetProps = {
  formId: string;
  metaTitle?: string;
  metaDesc?: string;
  ogTitle?: string;
  ogDesc?: string;
  twitterTitle?: string;
  twitterDesc?: string;
  errors?: any;
};

export const MetaDataSheet = ({
  formId,
  metaTitle,
  metaDesc,
  ogTitle,
  ogDesc,
  twitterTitle,
  twitterDesc,
  errors,
}: MetaDataSheetProps) => {
  const navigation = useNavigation();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"outline"}>
          <TowerControl />
        </Button>
      </SheetTrigger>
      <SheetContent position={"right"} size="content">
        <SheetHeader>
          <SheetTitle>Meta Data</SheetTitle>
          <SheetDescription>
            Here you can make changes to the meta data. <br></br>Click save when
            you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="metaTitle">
              Title
            </Label>
            <Input
              id="metaTitle"
              name="metaTitle"
              defaultValue={metaTitle}
              className="col-span-3"
              form={formId}
            />
            {errors && errors.metaTitle && (
              <p className="text-sm text-red-600">{errors.metaTitle}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="metaDesc">
              Desc.
            </Label>
            <Textarea
              id="metaDesc"
              name="metaDesc"
              defaultValue={metaDesc}
              className="col-span-3"
              form={formId}
            />
            {errors && errors.metaDesc && (
              <p className="text-sm text-red-600">{errors.metaDesc}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="ogTitle">
              OG Title
            </Label>
            <Input
              id="ogTitle"
              name="ogTitle"
              defaultValue={ogTitle}
              className="col-span-3"
              form={formId}
            />
            {errors && errors.ogTitle && (
              <p className="text-sm text-red-600">{errors.ogTitle}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="ogDesc">
              OG Desc.
            </Label>
            <Textarea
              id="ogDesc"
              name="ogDesc"
              defaultValue={ogDesc}
              className="col-span-3"
              form={formId}
            />
            {errors && errors.ogDesc && (
              <p className="text-sm text-red-600">{errors.ogDesc}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="twitterTitle">
              Twitter Title
            </Label>
            <Input
              id="twitterTitle"
              name="twitterTitle"
              defaultValue={twitterTitle}
              className="col-span-3"
              form={formId}
            />
            {errors && errors.twitterTitle && (
              <p className="text-sm text-red-600">{errors.twitterTitle}</p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right" htmlFor="twitterDesc">
              Twitter Desc.
            </Label>
            <Textarea
              id="twitterDesc"
              name="twitterDesc"
              defaultValue={twitterDesc}
              className="col-span-3"
              form={formId}
            />
            {errors && errors.twitterDesc && (
              <p className="text-sm text-red-600">{errors.twitterDesc}</p>
            )}
          </div>
        </div>
        <SheetFooter>
          <SaveButton
            type="submit"
            form={formId}
            navigationState={navigation.state}
          >
            Save
          </SaveButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
