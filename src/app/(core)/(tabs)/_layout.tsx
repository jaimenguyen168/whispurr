import React from "react";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { ThemeColors } from "@/src/constants/ThemeColors";

export default function TabsLayout() {
  return (
    <NativeTabs
      blurEffect="prominent"
      tintColor={ThemeColors.primary.base}
      minimizeBehavior="onScrollDown"
      rippleColor={ThemeColors.primary.light}
    >
      <NativeTabs.Trigger name="chats">
        <Label>Chats</Label>
        <Icon
          sf={{
            default: "ellipsis.message",
            selected: "ellipsis.message.fill",
          }}
          drawable="chat_drawable"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="groups">
        <Label>Groups</Label>
        <Icon
          sf={{
            default: "person.3",
            selected: "person.3.fill",
          }}
          drawable="people_drawable"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        <Icon
          sf={{
            default: "person",
            selected: "person.fill",
          }}
          drawable="profile_drawable"
        />
      </NativeTabs.Trigger>
      {/*<NativeTabs.Trigger name="more">*/}
      {/*  <Label>More</Label>*/}
      {/*  <Icon*/}
      {/*    sf={{*/}
      {/*      default: "line.3.horizontal.circle",*/}
      {/*      selected: "line.3.horizontal.circle.fill",*/}
      {/*    }}*/}
      {/*    drawable="more_drawable"*/}
      {/*  />*/}
      {/*</NativeTabs.Trigger>*/}
    </NativeTabs>
  );
}
