import { Vendor } from "@entity/vendor";

export type VendorRequestParameter = {
  name: string;
  address?: string;
  pic_name?: string;
  pic_phone_number?: string;
  code: string;
  shipping_cost: number
}
