import { MaterialIcons } from "@expo/vector-icons";

export interface ProfileButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  text: string;
  onPress: (event: GestureResponderEvent) => void;
}

export interface ProfileHeaderProps {
  name: string;
  phone: string;
  avatar: string;
}
