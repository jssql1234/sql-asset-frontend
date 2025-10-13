import { useCallback, useState } from "react";
import { Search } from "@/assets/icons";
import {
  Tabs,
  Button,
  Option,
  Badge,
  Switch,
  FilterChip,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Card,
  Banner,
} from "@/components/ui/components";
import { useToast } from "@/components/ui/components/Toast";
import {
  DropdownInput,
  Input,
  TextArea,
} from "@/components/ui/components/Input";
import TitleSubtitle from "@/components/TitleSubtitle";
import { SampleForm } from "./SampleForm";
import DialogExample from "./DialogExample";

import SearchWithDropdownExample from "@/example/SearchWithDropdownExample";
import MeterTableExample from "@/example/MeterManagementExample";

export default function Testing() {
  const tabItems = [
    {
      label: "Component",
      value: "component",
      content: <Component />,
    },
    {
      label: "Forms",
      value: "forms",
      content: <Form />,
    },
    {
      label: "Fonts",
      value: "fonts",
      content: <Font />,
    },
    {
      label: "Colors",
      value: "color",
      content: <Color />,
    },
    {
      label: "Tabs",
      value: "tabs",
      content: <Tab />,
    },
  ];

  return (
    <div className="space-y-2 p-6 h-screen w-screen overflow-auto">
      <TitleSubtitle
        title={"This is the title"}
        subtitle={
          "TitleSubtitle component is now allow you to add back button and add buttons at the most right"
        }
        backButton
      >
        <Button>Example Button</Button>
      </TitleSubtitle>
      <Tabs tabs={tabItems} defaultValue="component" variant="expanded" />
    </div>
  );
}

function Component() {
  const { addToast } = useToast();

  const [showBanner, setShowBanner] = useState(false);

  const options = Array.from({ length: 3 }, (_, i) => ({
    value: `item${i}`,
    label: `Item ${i}`,
  }));
  const [checkedValue, setCheckedValue] = useState(["item1"]);
  const [selectedValue, setSelectedValue] = useState("item1");

  const [isAllChecked, setIsAllChecked] = useState(false);
  const [filterChecked, setFilterchecked] = useState([false, false]);

  const handleChange = useCallback((checked: boolean) => {
    setIsAllChecked(checked);
    setFilterchecked(new Array(filterChecked.length).fill(checked));
  }, []);

  const handleToggle = (index: number, checked: boolean) => {
    const updated = [...filterChecked];
    updated[index] = checked;
    setFilterchecked(updated);
    const selectAll = updated.every((e) => e === true);
    setIsAllChecked(selectAll);
  };

  return (
    <div className="mt-4 space-y-6">
      <div className="space-y-2">
        <div className="title-small text-onSurface">The Banner</div>
        <Button
          onClick={() => {
            setShowBanner(true);
          }}
        >
          Show Info Banner
        </Button>
        <Banner
          open={showBanner}
          onClose={() => {
            setShowBanner(false);
          }}
          variant="info"
          title="Don't know AppKey?"
          description="You can contact the corresponding R & D students to confirm whether you have applied for an application on the application cloud platform , and fill in the corresponding information."
        />
        <Banner
          variant="warning"
          title="Storage Almost Full (No border)"
          description="You're using 85% of your storage space. Consider upgrading your plan or removing unused files."
        />
        <Banner
          variant="error"
          title="Payment Failed (No dismissible)"
          description="Your subscription payment could not be processed. Please update your payment method to continue using our services."
          dismissible={false}
        />
        <Banner
          variant="success"
          title="Account Successfully Verified (No icon)"
          description="Your email address has been confirmed and your account is now fully activated."
          icon={false}
        />
      </div>

      <div className="space-y-2">
        <div className="title-small text-onSurface">The Dialog</div>
        <DialogExample />
      </div>

      <div className="space-y-2">
        <div className="title-small text-onSurface">The Badges</div>
        <div className="flex flex-row items-center gap-3">
          <Badge text="Primary" variant="primary"></Badge>
          <Badge text="Red" variant="red"></Badge>
          <Badge text="Green" variant="green"></Badge>
          <Badge text="Yellow" variant="yellow" dot></Badge>
          <Badge text="Blue" variant="blue" dot></Badge>
        </div>
      </div>

      <div className="space-y-2">
        <div className="title-small text-onSurface">The Buttons</div>
        <div className="flex flex-row items-center gap-3">
          <Button variant="default" size="default">
            Default
          </Button>
          <Button variant="destructive" size="default">
            Destructive
          </Button>
          <Button variant="outline" size="default">
            Outline
          </Button>
          <Button variant="secondary" size="default">
            Secondary
          </Button>
          <Button variant="link" size="default">
            Link
          </Button>
          <Button variant="default" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="title-small text-onSurface">The Toasts</div>
        <div className="flex flex-row items-center gap-3">
          <Button
            onClick={() =>
              addToast({
                variant: "success",
                title: "Clicked success toast",
                description: "This is a success toast",
                position: "topLeft",
              })
            }
          >
            Success
          </Button>
          <Button
            onClick={() =>
              addToast({
                variant: "error",
                title: "Clicked error",
                description: "This is an error toast",
                action: [{ label: "Try again" }],
                dismissible: true,
                position: "bottomLeft",
              })
            }
          >
            Error
          </Button>
          <Button
            onClick={() =>
              addToast({
                variant: "info",
                title: "Clicked info",
                description: "This is an info toast",
                position: "top",
              })
            }
          >
            Info
          </Button>
          <Button
            onClick={() =>
              addToast({
                variant: "loading",
                title: "Clicked loading",
                description: "This is a loading toast...",
                position: "bottom",
              })
            }
          >
            Loading
          </Button>
          <Button
            onClick={() =>
              addToast({
                variant: "warning",
                title: "Clicked warning",
                description: "This is a warning toast",
              })
            }
          >
            Warning
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="title-small text-onSurface">The Options</div>
        <div className="flex flex-row items-center gap-3">
          <Option type="checkbox" readOnly />
          <Option type="checkbox" checked readOnly />
          <Option type="radio" readOnly />
          <Option type="radio" checked />
        </div>
      </div>

      <div className="space-y-2">
        <div className="title-small text-onSurface">The Dropdowns</div>
        <div className="flex flex-row items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger label="Dropdown (Item)" />
            <DropdownMenuContent>
              <DropdownMenuItem>Item 1</DropdownMenuItem>
              <DropdownMenuItem>Item 2</DropdownMenuItem>
              <DropdownMenuItem>Item 3</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger label="Dropdown (Checkbox)" />
            <DropdownMenuContent>
              {options.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={checkedValue.includes(option.value)}
                  onClick={() => {
                    setCheckedValue((prev) =>
                      prev.includes(option.value)
                        ? prev.filter((item) => item !== option.value)
                        : [...prev, option.value]
                    );
                  }}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger label="Dropdown (Radio)" />
            <DropdownMenuContent>
              <DropdownMenuRadioGroup
                value={selectedValue}
                onValueChange={setSelectedValue}
              >
                {options.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-2">
        <div className="title-small text-onSurface">The Switches</div>
        <Switch isChecked={isAllChecked} onChange={handleChange} />
        <Switch
          size="lg"
          label="This is a L size switch"
          isChecked={isAllChecked}
        />
        <Switch
          size="default"
          label="This is a M size switch"
          isChecked={isAllChecked}
        />
        <Switch
          size="sm"
          label="This is a S size switch"
          isChecked={isAllChecked}
        />
      </div>

      <div className="space-y-2">
        <div className="title-small text-onSurface">The Filter Chips</div>
        <div className="flex flex-row items-center gap-3">
          <FilterChip
            selected={isAllChecked}
            onChange={(checked) => handleToggle(0, checked)}
          >
            Filter 1
          </FilterChip>
          <FilterChip
            selected={isAllChecked}
            onChange={(checked) => handleToggle(1, checked)}
          >
            Filter 2
          </FilterChip>
        </div>
      </div>

      <div className="space-y-2 text-onSurface">
        <div className="title-small">The Card</div>
        <Card>Put any components here</Card>
      </div>

      <div className="space-y-2">
        <div className="title-small text-onSurface"> The Search With Dropdown</div>
        <div className="">
          <SearchWithDropdownExample /> 
        </div>
      </div>

      <div className="">
        <div className="title-small text-onSurface"> The Meter Table</div>
        <div className="">
          <MeterTableExample />
        </div>
      </div>
    </div>
  );
}

type DropdownInputItem = {
  value: string;
  leftIcon?: React.ReactNode;
};

function Form() {
  function getPhoneImage(imgPath: string, imgAlt: string): React.ReactNode {
    return <img src={imgPath} alt={imgAlt} className="w-4 h-4" />;
  }

  const COUNTRY_PHONE_NO: DropdownInputItem[] = [
    {
      value: "+60",
      leftIcon: getPhoneImage("src/assets/flags-icons/my.svg", "MY"),
    },
    {
      value: "+1",
      leftIcon: getPhoneImage("src/assets/flags-icons/us.svg", "US"),
    },
    {
      value: "+65",
      leftIcon: getPhoneImage("src/assets/flags-icons/sg.svg", "SG"),
    },
    { value: "no icon" },
  ];

  return (
    <div className="space-y-4 mt-6">
      <div className="space-y-2">
        <div className="title-small text-onSurface">The Text Area</div>
        <TextArea placeholder="This is text area." />
        <TextArea
          rows={3}
          maxRows={5}
          placeholder="Preset the Text Area size here"
        />
      </div>
      <div className="title-small text-onSurface">The Input</div>
      <Input placeholder="Placeholder" />
      <DropdownInput
        options={COUNTRY_PHONE_NO}
        selected={COUNTRY_PHONE_NO[0]}
        onChangeDropdown={() => {}}
        onChangeInput={() => {}}
        label={"Phone Number"}
        placeholder={"Enter Phone Number"}
      />
      <div className="relative flex flex-col pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            label="Full Width Dropdown with Match Trigger Width"
            className="w-full justify-between"
          />
          <DropdownMenuContent matchTriggerWidth>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <SampleForm />
    </div>
  );
}

function Font() {
  function getFonts(color: string): React.ReactNode {
    const tColor = `${
      color === "bg-onSurfaceVariant" ||
      color === "bg-onSurface" ||
      color === "bg-surfaceVariant"
        ? "text-inverseOnSurface"
        : "text-onPrimary"
    }`;
    return (
      <>
        <div className="space-y-1">
          <div
            className={`
              ${tColor} ${color} border border-outline p-4 w-min rounded-sm label-medium
            `}
          >
            {color.replace("bg-", "")}
          </div>
        </div>
        <div className="space-y-1">
          <div className="title-large">Title Large</div>
          <div className="title-medium">Title Medium</div>
          <div className="title-small">Title Small</div>
        </div>
        <div className="space-y-1">
          <div className="body-large">Body Large</div>
          <div className="body-medium">Body Medium</div>
          <div className="body-small">Body Small</div>
        </div>
        <div className="space-y-1">
          <div className="label-large">Label Large</div>
          <div className="label-medium">Label Medium</div>
          <div className="label-small">Label Small</div>
        </div>
        <div className="space-y-1">
          <div className="label-large-bold">Label Large Bold</div>
          <div className="label-medium-bold">Label Medium Bold</div>
          <div className="label-small-bold">Label Small Bold</div>
        </div>
      </>
    );
  }
  return (
    <div className="flex flex-wrap mt-6 gap-12">
      <div className="text-onSurface space-y-4">{getFonts("bg-onSurface")}</div>
      <div className="text-surfaceVariant space-y-4">
        {getFonts("bg-surfaceVariant")}
      </div>
      <div className="text-onSurfaceVariant space-y-4">
        {getFonts("bg-onSurfaceVariant")}
      </div>
      <div className="text-primary space-y-4">{getFonts("bg-primary")}</div>
      <div className="text-error space-y-4">{getFonts("bg-error")}</div>
    </div>
  );
}

function Color() {
  function getColor(color: string, textColor?: string): React.ReactNode {
    const txtColor = textColor ?? "text-onSurface";
    return (
      <div
        className={`
        ${txtColor} ${color} border border-outline 
          p-4 w-min rounded-sm label-medium
        `}
      >
        {color.replace("bg-", "")}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap mt-6 gap-12">
      <div className="space-y-2">
        {getColor("bg-surfaceContainerHighest")}
        <div className="space-y-0.5">
          <div className="title-small text-onSurface">
            Surface Container Highest
          </div>
          <div className="body-medium text-onSurfaceVariant">Use by Input</div>
        </div>
      </div>

      <div className="space-y-2">
        {getColor("bg-surfaceContainerHigh")}
        <div className="space-y-0.5">
          <div className="title-small text-onSurface">
            Surface Container High
          </div>
          <div className="body-medium text-onSurfaceVariant">Use by Dialog</div>
        </div>
      </div>

      <div className="space-y-2">
        {getColor("bg-surfaceContainerLow")}
        <div className="space-y-0.5">
          <div className="title-small text-onSurface">
            Surface Container Low
          </div>
          <div className="body-medium text-onSurfaceVariant">
            Use by Sidebar, Card, Table
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {getColor("bg-surfaceContainerLowest")}
        <div className="space-y-0.5">
          <div className="title-small text-onSurface">
            Surface Container Lowest
          </div>
          <div className="body-medium text-onSurfaceVariant">
            Use by Selected Tab
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {getColor("bg-background")}
        <div className="space-y-0.5">
          <div className="title-small text-onSurface">Background</div>
          <div className="body-medium text-onSurfaceVariant">
            Use by Background
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {getColor("bg-primary", "text-onPrimary")}
        <div className="space-y-0.5">
          <div className="title-small text-onSurface">Primary</div>
          <div className="body-medium text-onSurfaceVariant">Theme color</div>
        </div>
      </div>

      <div className="space-y-2">
        {getColor("bg-primaryContainer", "text-onPrimaryContainer")}
        <div className="space-y-0.5">
          <div className="title-small text-onSurface">PrimaryContainer</div>
          <div className="body-medium text-onSurfaceVariant">
            Use by primary chip and filter chip
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {getColor("bg-secondary", "text-onSecondary")}
        <div className="space-y-0.5">
          <div className="title-small text-onSurface">Secondary</div>
          <div className="body-medium text-onSurfaceVariant">
            Use by secondary button, table selected row
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {getColor("bg-secondaryContainer", "text-onSecondaryContainer")}
        <div className="space-y-0.5">
          <div className="title-small text-onSurface">SecondaryContainer</div>
          <div className="body-medium text-onSurfaceVariant">
            Use by tabs background
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {getColor("bg-tertiary", "text-onTertiary")}
        <div className="space-y-0.5">
          <div className="title-small text-onSurface">Tertiary</div>
          <div className="body-medium text-onSurfaceVariant">
            No component using currently
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {getColor("bg-tertiaryContainer", "text-onTertiaryContainer")}
        <div className="space-y-0.5">
          <div className="title-small text-onSurface">TertiaryContainer</div>
          <div className="body-medium text-onSurfaceVariant">Use by header</div>
        </div>
      </div>
    </div>
  );
}

function Tab() {
  const tabItems = [
    {
      label: "Tab 1",
      value: "tab1",
      content: <div className="text-onSurface">Tab 1</div>,
    },
    {
      label: "Tab 2",
      value: "tab2",
      content: <div className="text-onSurface">Tab 2</div>,
    },
  ];

  const longTabItems = [
    {
      label: "Example of longlonglonglonglonglong Tab 1",
      value: "tab1",
      content: <div></div>,
    },
    {
      label: "Tab 2",
      value: "tab2",
      content: <div></div>,
    },
    {
      label:
        "Example of longlonglonglonglonglonglonglonglonglonglonglong Tab 3",
      value: "tab3",
      content: <div></div>,
    },
    {
      label: "Tab 4",
      value: "tab4",
      content: <div></div>,
    },
  ];
  return (
    <div className="mt-6 space-y-10">
      <div className="space-y-2">
        <div className="title-medium text-onSurface">Default Tabs</div>
        <Tabs tabs={tabItems} defaultValue="tab1" />
      </div>

      <div className="space-y-2">
        <div className="title-medium text-onSurface">Expanded Tabs</div>
        <Tabs tabs={tabItems} defaultValue="tab1" variant="expanded" />
      </div>

      <div className="space-y-2">
        <div className="title-medium text-onSurface">Underline Tabs</div>
        <Tabs tabs={tabItems} defaultValue="tab1" variant="underline" />
      </div>

      <div className="space-y-2">
        <div className="title-medium text-onSurface">Default Long Tabs</div>
        <Tabs tabs={longTabItems} defaultValue="tab1" />
      </div>

      <div className="space-y-2">
        <div className="title-medium text-onSurface">Expanded Long Tabs</div>
        <Tabs tabs={longTabItems} defaultValue="tab1" variant="expanded" />
      </div>

      <div className="space-y-2">
        <div className="title-medium text-onSurface">Underline Long Tabs</div>
        <Tabs tabs={longTabItems} defaultValue="tab1" variant="underline" />
      </div>
    </div>
  );
}
