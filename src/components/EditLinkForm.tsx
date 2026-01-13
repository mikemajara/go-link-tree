import {
  Form,
  ActionPanel,
  Action,
  showToast,
  Toast,
  useNavigation,
  Icon,
} from "@raycast/api";
import { useState } from "react";
import type { Link, LinkGroup } from "../types";
import { updateLinkInConfig, addLinkToConfig } from "../lib/config";

// Props for editing an existing link
interface EditLinkFormPropsEdit {
  mode: "edit";
  link: Link;
  groupName: string;
  groups?: never;
}

// Props for creating a new link
interface EditLinkFormPropsCreate {
  mode: "create";
  link?: never;
  groupName?: never;
  groups: LinkGroup[];
}

type EditLinkFormProps = EditLinkFormPropsEdit | EditLinkFormPropsCreate;

// Common browser options for the dropdown
const BROWSER_OPTIONS = [
  { title: "System Default", value: "" },
  { title: "Google Chrome", value: "com.google.Chrome" },
  { title: "Brave Browser", value: "com.brave.Browser" },
  { title: "Firefox", value: "org.mozilla.firefox" },
  { title: "Safari", value: "com.apple.Safari" },
  { title: "Arc", value: "company.thebrowser.Browser" },
  { title: "Microsoft Edge", value: "com.microsoft.edgemac" },
];

const NEW_GROUP_VALUE = "__new_group__";

interface FormValues {
  title: string;
  url: string;
  icon: string;
  keywords: string;
  application: string;
  profile: string;
  groupName?: string;
  newGroupName?: string;
  newGroupTitle?: string;
}

export function EditLinkForm(props: EditLinkFormProps) {
  const { pop } = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>(
    props.mode === "create" && props.groups.length > 0
      ? props.groups[0].name
      : NEW_GROUP_VALUE
  );

  const isCreateMode = props.mode === "create";
  const isNewGroup = selectedGroup === NEW_GROUP_VALUE;

  // For edit mode, get initial values from the link
  const initialKeywords =
    props.mode === "edit" ? props.link.keywords?.join(", ") || "" : "";

  async function handleSubmit(values: FormValues) {
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!values.title.trim()) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Title Required",
          message: "Please enter a title for the link",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate URL
      try {
        new URL(values.url);
      } catch {
        await showToast({
          style: Toast.Style.Failure,
          title: "Invalid URL",
          message: "Please enter a valid URL",
        });
        setIsSubmitting(false);
        return;
      }

      // Parse keywords from comma-separated string
      const keywords = values.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      // Build link object
      const linkData: Link = {
        title: values.title.trim(),
        url: values.url.trim(),
        ...(keywords.length > 0 && { keywords }),
        ...(values.icon?.trim() && { icon: values.icon.trim() }),
        ...(values.application && { application: values.application }),
        ...(values.profile?.trim() && { profile: values.profile.trim() }),
      };

      if (isCreateMode) {
        // Validate group selection for new links
        if (isNewGroup) {
          if (!values.newGroupName?.trim()) {
            await showToast({
              style: Toast.Style.Failure,
              title: "Group Name Required",
              message: "Please enter a name for the new group",
            });
            setIsSubmitting(false);
            return;
          }
          if (!values.newGroupTitle?.trim()) {
            await showToast({
              style: Toast.Style.Failure,
              title: "Group Title Required",
              message: "Please enter a title for the new group",
            });
            setIsSubmitting(false);
            return;
          }
        }

        const targetGroupName = isNewGroup
          ? values.newGroupName!.trim()
          : values.groupName!;
        const newGroupTitle = isNewGroup ? values.newGroupTitle!.trim() : undefined;

        await addLinkToConfig(targetGroupName, linkData, newGroupTitle);

        await showToast({
          style: Toast.Style.Success,
          title: "Link Created",
          message: `"${values.title}" has been added`,
        });
      } else {
        // Edit mode
        await updateLinkInConfig(props.groupName, props.link.url, linkData);

        await showToast({
          style: Toast.Style.Success,
          title: "Link Updated",
          message: `"${values.title}" has been saved`,
        });
      }

      pop();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save link";
      await showToast({
        style: Toast.Style.Failure,
        title: "Save Failed",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form
      isLoading={isSubmitting}
      navigationTitle={isCreateMode ? "Create New Link" : "Edit Link"}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={isCreateMode ? "Create Link" : "Save Link"}
            icon={isCreateMode ? Icon.Plus : Icon.Check}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      {isCreateMode && (
        <>
          <Form.Dropdown
            id="groupName"
            title="Group"
            value={selectedGroup}
            onChange={setSelectedGroup}
            info="Select an existing group or create a new one"
          >
            {props.groups.map((group) => (
              <Form.Dropdown.Item
                key={group.name}
                title={group.title}
                value={group.name}
              />
            ))}
            <Form.Dropdown.Item
              title="+ Create New Group"
              value={NEW_GROUP_VALUE}
              icon={Icon.PlusCircle}
            />
          </Form.Dropdown>
          {isNewGroup && (
            <>
              <Form.TextField
                id="newGroupName"
                title="Group Name"
                placeholder="my-group"
                info="Unique identifier for the group (lowercase, no spaces)"
              />
              <Form.TextField
                id="newGroupTitle"
                title="Group Title"
                placeholder="🏷️ My Group"
                info="Display title for the group (can include emoji)"
              />
            </>
          )}
          <Form.Separator />
        </>
      )}
      <Form.TextField
        id="title"
        title="Title"
        placeholder="My Link"
        defaultValue={props.mode === "edit" ? props.link.title : ""}
        info="The display name for this link"
      />
      <Form.TextField
        id="url"
        title="URL"
        placeholder="https://example.com"
        defaultValue={props.mode === "edit" ? props.link.url : ""}
        info="The URL to open"
      />
      <Form.TextField
        id="icon"
        title="Icon"
        placeholder="🔗 or Link, Globe, Code..."
        defaultValue={props.mode === "edit" ? props.link.icon || "" : ""}
        info="Emoji or Raycast icon name (e.g., Link, Globe, Code, Star)"
      />
      <Form.TextField
        id="keywords"
        title="Keywords"
        placeholder="keyword1, keyword2, keyword3"
        defaultValue={initialKeywords}
        info="Comma-separated search keywords"
      />
      <Form.Separator />
      <Form.Dropdown
        id="application"
        title="Browser"
        defaultValue={props.mode === "edit" ? props.link.application || "" : ""}
        info="Choose a specific browser or use system default"
      >
        {BROWSER_OPTIONS.map((browser) => (
          <Form.Dropdown.Item
            key={browser.value}
            title={browser.title}
            value={browser.value}
          />
        ))}
      </Form.Dropdown>
      <Form.TextField
        id="profile"
        title="Browser Profile"
        placeholder="Work, Personal, Default..."
        defaultValue={props.mode === "edit" ? props.link.profile || "" : ""}
        info="Browser profile name (for Chrome, Brave, Edge, Firefox)"
      />
    </Form>
  );
}
