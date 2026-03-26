import type { Config } from "@puckeditor/core";
import { Heading } from "./blocks/heading";
import { Text } from "./blocks/text";
import { Image } from "./blocks/image";
import { Button } from "./blocks/button";
import { Spacer } from "./blocks/spacer";
import { Columns } from "./blocks/columns";

export const puckConfig: Config = {
  components: {
    Heading,
    Text,
    Image,
    Button,
    Spacer,
    Columns,
  },
};
