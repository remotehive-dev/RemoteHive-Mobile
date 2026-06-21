import "lucide-react-native";
import { ColorValue } from "react-native";

declare module "lucide-react-native" {
  interface LucideProps {
    color?: ColorValue;
    stroke?: ColorValue;
    fill?: ColorValue;
  }
}
