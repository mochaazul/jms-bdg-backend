import { Vendor } from "@entity/vendor";
import _ from "lodash";
import { VendorRequestParameter } from "./vendor.interfaces";

export const getAllVendorService = async () => {
  try {
    return await Vendor.find();
  } catch (error) {
    console.error(error)
  }
}

export const findVendorService = async (query: string) => {
  try {
    const vendor = await Vendor.createQueryBuilder()
      .where('vendor.name LIKE :query', { query })
      .getMany();
    if (_.isEmpty(vendor)) return { message: "Vendor is not found!" };
    return vendor
  } catch (error) {
    console.error(error)
  }
}

export const addVendorService = async (body: VendorRequestParameter) => {
  try {
    const _newVendor = new Vendor();
    _newVendor.name = body.name;
    _newVendor.address = body.address;
    _newVendor.pic_name = body.pic_name;
    _newVendor.pic_phone_number = body.pic_phone_number;
    await _newVendor.save();
    return await Vendor.findOne({
      where: { id: _newVendor.id }
    });
  } catch (error) {
    console.error(error)
  }
}

export const updateVendorService = async (id: string , body: VendorRequestParameter) => {
  try {
    const vendor = await Vendor.findOneOrFail({ where: { id } });
    vendor['address'] = body.address;
    vendor['name'] = body.name;
    vendor['pic_name'] = body.pic_name;
    vendor['pic_phone_number'] = body.pic_phone_number;
    await vendor.save();
    return await Vendor.findOne({
      where: { id }
    });
  } catch (error) {
    console.error(error)
  }
}

export const deleteVendorService = async (id: string) => {
  try {
    const vendor = await Vendor.findOneOrFail({ where: { id } });
    await vendor.remove();
    return { message: "Vendor is deleted!" };
  } catch (error) {
    console.error(error)
  }
}