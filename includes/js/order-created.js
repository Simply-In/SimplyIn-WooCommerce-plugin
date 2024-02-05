/* eslint-disable */

let shopBaseTwo = "../../..";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
if (orderData?.base_url) {
  shopBaseTwo = orderData?.base_url;
  console.log(orderData?.base_url);
}

const middlewareApiTwo = ({ endpoint, method, requestBody, token }) => {
  return fetch(`${shopBaseTwo}/wp-json/simplyin/data/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpoint,
      method,
      requestBody,
      ...(token ? { token } : {}),
    }),
  })
    .then((response) => response.json())
    .catch((error) => {
      console.log(error);
    });
};

const loadDataFromSessionStorageTwo = ({ key }) => {
  try {
    const serializedData = sessionStorage.getItem(key);
    if (serializedData === null) {
      return undefined;
    }

    return JSON.parse(serializedData);
  } catch (error) {
    console.error("Error loading data", error);
    return undefined;
  }
};

jQuery(document).ready(async function ($) {
  console.log("Order has been created.");
  console.log(orderData);
  console.log(
    orderData.orderTotal.meta_data.find((el) => el.key === "_parcel_machine_id")
  );

  //   return;
  const getLangBrowser = () => {
    if (navigator.languages !== undefined) return navigator.languages[0];
    else return navigator.language;
  };

  let shortLang = (lang) => lang.substring(0, 2).toUpperCase();

  const billingAddresses = [
    {
      addressName:
        orderData.billingAddresses.companyName.trim().substring(0, 15) || "",
      street: (orderData.billingAddresses.address_1 || "").trim(),
      appartmentNumber: (orderData.billingAddresses.address_2 || "").trim(),
      city: (orderData.billingAddresses.city || "").trim(),
      postalCode: (orderData.billingAddresses.postcode || "").trim(),
      country: (orderData.billingAddresses.country || "").trim(),
      taxId: (orderData.billingAddresses.taxId || "").trim(),
      companyName: (orderData.billingAddresses.companyName || "").trim(),
      name: (orderData.billingAddresses.first_name || "").trim(),
      surname: (orderData.billingAddresses.last_name || "").trim(),
      state: (orderData.billingAddresses.state || "").trim() || "",
      taxId: (orderData.billingAddresses.tax_id || "").trim() || "",
    },
  ];
  const shippingAddresses = [
    {
      addressName:
        orderData.shippingAddresses.companyName.trim().substring(0, 15) || "",
      street: (orderData.shippingAddresses.address_1 || "").trim(),
      appartmentNumber: (orderData.shippingAddresses.address_2 || "").trim(),
      city: (orderData.shippingAddresses.city || "").trim(),
      postalCode: (orderData.shippingAddresses.postcode || "").trim(),
      country: (orderData.shippingAddresses.country || "").trim(),
      companyName: (orderData.shippingAddresses.companyName || "").trim(),
      name: (orderData.shippingAddresses.first_name || "").trim(),
      surname: (orderData.shippingAddresses.last_name || "").trim(),
      state: (orderData.shippingAddresses.state || "").trim() || "",
    },
  ];

  const deliveryPoint = orderData?.orderTotal?.meta_data?.find(
    (el) => el.key === "_parcel_machine_id"
  )?.value;

  const res = await fetch(
    `https://api-pl-points.easypack24.net/v1/points/${deliveryPoint}`
  );
  const inpostPointData = await res?.json();

  console.log("inpostPointData", inpostPointData);

  const parcelLockers = [
    {
      addressName: "",
      label: "INPOST",
      lockerId: deliveryPoint,
      address: `${inpostPointData?.address?.line1 || ""}, ${
        inpostPointData?.address?.line2 || ""
      }`,
    },
  ];

  const simplyinToken = loadDataFromSessionStorageTwo({ key: "simplyinToken" });
  const phoneNumber = loadDataFromSessionStorageTwo({ key: "phoneInput" });

  const orderItems = orderData.line_items.map((item) => {
    return {
      name: item.name || "",
      url: item.product_url || "",
      price: item.price || "",
      quantity: item.quantity || "",
      currency: orderData.orderTotal.currency || "",
      thumbnailUrl: item.image_url || "",
    };
  });
  //   EasyPackPointObject
  //   {"pointName":"SDI01M","pointDesc":"Wolska 32","pointAddDesc":"Przy delikatesach Fikus"}
  //   console.log(orderItems);
  //   console.log(userData);

  if (!!simplyinToken && typeof orderData !== "undefined") {
    const userData = loadDataFromSessionStorageTwo({
      key: "UserData",
    });

    function addIfValueNotExists(newObj, arrayKey) {
      const keys = Object.keys(newObj)
        .filter((key) => newObj[key] != "")
        .filter((key) => newObj[key] != null)
        .filter((key) => key != "addressName")
        .filter((key) => key != "_id");

      for (let existingObj of userData[arrayKey]) {
        if (keys.every((key) => newObj[key] === existingObj[key])) {
          return;
        }
      }

      userData[arrayKey].push(newObj);
    }
    // userData.parcelLockers = [];

    addIfValueNotExists(billingAddresses[0], "billingAddresses");
    addIfValueNotExists(shippingAddresses[0], "shippingAddresses");

    if (deliveryPoint) {
      addIfValueNotExists(parcelLockers[0], "parcelLockers");
    }

    // if there is parcelLocker without id it means it has been just added
    const arrayOfIdParcel = userData.parcelLockers.map((el) => el._id);
    const indexOfUndefinedParcel = arrayOfIdParcel.indexOf(undefined);

    const arrayOfId = userData.shippingAddresses.map((el) => el._id);
    const indexOfUndefined = arrayOfId.indexOf(undefined);

    const arrayOfIdBilling = userData.billingAddresses.map((el) => el._id);
    const indexOfUndefinedBilling = arrayOfIdBilling.indexOf(undefined);

    // console.log("arrayOfId", arrayOfId);
    // console.log("indexOfUndefined", indexOfUndefined);

    middlewareApiTwo({
      endpoint: "userData",
      method: "PATCH",
      token: simplyinToken,
      requestBody: userData,
    })
      .then((res) => {
        console.log("User data updated");
        console.log(res);

        let newItem;
        if (indexOfUndefined !== -1) {
          //jest nowy element

          const idNotInModel = res.data.shippingAddresses.filter(
            (item) => !arrayOfId.includes(item._id)
          )[0];

          newItem = res.data.shippingAddresses.find(
            (item) => item._id === idNotInModel?._id
          );
        } else {
          const ShippingIndex = loadDataFromSessionStorageTwo({
            key: "ShippingIndex",
          });
          const BillingIndex = loadDataFromSessionStorageTwo({
            key: "BillingIndex",
          });
          newItem =
            ShippingIndex !== null
              ? res.data?.shippingAddresses[ShippingIndex]
              : res.data?.billingAddresses[BillingIndex];

          //   console.log("2 newItem", newItem);
          //nie ma nowego elementu
        }

        let newItemBilling;

        //Nie ma elementów bez id.
        if (indexOfUndefinedBilling !== -1) {
          //jest nowy element

          console.log("res.data.billingAddresses", res.data.billingAddresses);

          const idNotInModel = res.data.billingAddresses.filter(
            (item) => !arrayOfIdBilling.includes(item._id)
          )[0];

          console.log("idNotInModel", idNotInModel); //lapie undefined

          newItemBilling = res.data.billingAddresses.find((item) => {
            if (idNotInModel && "_id" in idNotInModel) {
              return item._id === idNotInModel._id;
            }
          });
          console.log("newItemBilling", newItemBilling);
        } else {
          const BillingIndex = loadDataFromSessionStorageTwo({
            key: "BillingIndex",
          });

          //   const BillingIndexOldMethod = loadDataFromSessionStorage({
          //     key: "BillingIndex",
          //   });
          console.log("Billing index from local storage", BillingIndex);
          //   console.log(
          //     "Billing index from local storage BillingIndexOldMethod",
          //     BillingIndexOldMethod
          //   );

          newItemBilling = res.data?.billingAddresses[BillingIndex];

          console.log("newItemBilling", newItemBilling);
          newItemBilling.state =
            newItemBilling.state !== undefined && newItemBilling.state !== null
              ? newItemBilling.state
              : "";
          newItemBilling.taxId =
            newItemBilling.taxId !== undefined && newItemBilling.taxId !== null
              ? newItemBilling.taxId
              : "";
          newItemBilling.appartmentNumber =
            newItemBilling.appartmentNumber !== undefined &&
            newItemBilling.appartmentNumber !== null
              ? newItemBilling.appartmentNumber
              : "";

          //   console.log("2 newItem", newItem);
          //nie ma nowego elementu
        }

        let newItemParcel;
        if (indexOfUndefinedParcel !== -1) {
          //jest nowy element

          const idNotInModel = res.data.parcelLockers.filter(
            (item) => !arrayOfIdParcel.includes(item._id)
          )[0];

          newItemParcel = res.data.parcelLockers.find(
            (item) => item._id === idNotInModel._id
          );
        } else {
          const ParcelIndex = loadDataFromSessionStorageTwo({
            key: "ParcelIndex",
          });

          newItemParcel = res.data?.parcelLockers[ParcelIndex];

          //nie ma nowego elementu
        }
        console.log("create new order");
        middlewareApiTwo({
          endpoint: "checkout/createOrder",
          method: "POST",
          token: simplyinToken,
          requestBody: {
            desc: "",
            price: Number(orderData.orderTotal.total),
            currency: orderData.orderTotal.currency,
            placedDuringAccountCreation: false,
            items: orderItems,
            name: orderData.billingAddresses.first_name.trim(),
            surname: orderData.billingAddresses.last_name.trim(),
            shopName: orderData.shopName || "",
            billingData: { ...newItemBilling },
            ...(deliveryPoint
              ? {
                  parcelLockerData: {
                    _id: newItemParcel?._id,
                    addressName: newItemParcel?.addressName,
                    label: newItemParcel?.label,
                    lockerId: newItemParcel?.lockerId,
                    address: newItemParcel?.address,
                  },
                }
              : {
                  shippingData: {
                    ...shippingAddresses[0],
                    state: "",
                    _id: newItem._id,
                  },
                }),
          },
        });
      })
      .then(() => {
        sessionStorage.removeItem("simplyinToken");
        sessionStorage.removeItem("UserData");
        sessionStorage.removeItem("phoneInput");
        sessionStorage.removeItem("ParcelIndex");
        sessionStorage.removeItem("BillingIndex");
        sessionStorage.removeItem("ShippingIndex");
      });

    return;
  }

  //tworzenie konta

  const parcelLockersNewAccount = deliveryPoint
    ? [
        {
          addressName: "",
          label: "INPOST",
          lockerId: deliveryPoint,
          address: `${inpostPointData?.address?.line1 || ""}, ${
            inpostPointData?.address?.line2 || ""
          }`,
        },
      ]
    : [];

  if (!!orderData.create_new_account && typeof orderData !== "undefined") {
    middlewareApiTwo({
      endpoint: "checkout/createUserData",
      method: "POST",
      requestBody: {
        name: (orderData.billingAddresses.first_name || "").trim(),
        surname: (orderData.billingAddresses.last_name || "").trim(),
        email: (orderData.billingAddresses.email || "").trim().toLowerCase(),
        phoneNumber: (phoneNumber || "").trim(),
        billingAddresses: billingAddresses || [],
        shippingAddresses: shippingAddresses || [],
        parcelLockers: parcelLockersNewAccount,
        language: shortLang(getLangBrowser() ?? orderData?.language),
        // language: "PL",
        termsAndConditionsAccepted: true,
        marketingConsent: true,
      },
    })
      .then((res) => {
        // console.log(res.authToken);
        if (res.error) {
          throw new Error(res.error);
        }
        console.log("Simply account created with data:", res);
        return res;
      })
      .then((res) => {
        console.log(res);

        const orderShippingParcelInfoNewAccount = deliveryPoint
          ? {
              parcelLockerData: {
                _id: res?.data?.parcelLockers[0]?._id,
                addressName: res?.data?.parcelLockers[0]?.addressName,
                label: res?.data?.parcelLockers[0]?.label,
                lockerId: res?.data?.parcelLockers[0]?.lockerId,
                address: res?.data?.parcelLockers[0]?.address,
              },
            }
          : { shippingData: res?.data?.shippingAddresses[0] };

        middlewareApiTwo({
          endpoint: "checkout/createOrder",
          method: "POST",
          token: res.authToken,
          requestBody: {
            desc: "",
            price: Number(orderData.orderTotal.total),
            currency: orderData.orderTotal.currency,
            placedDuringAccountCreation: true,
            items: orderItems,
            name: (orderData.billingAddresses.first_name || "").trim(),
            surname: (orderData.billingAddresses.last_name || "").trim(),
            shopName: orderData.shopName || "",
            billingData: res?.data?.billingAddresses[0],
            ...orderShippingParcelInfoNewAccount,
          },
        });
      })
      .then(() => {
        sessionStorage.removeItem("simplyinToken");
        sessionStorage.removeItem("UserData");
        sessionStorage.removeItem("phoneInput");
        sessionStorage.removeItem("electronicContactApprove");
        sessionStorage.removeItem("marketingContactApprove");
        sessionStorage.removeItem("isInpostKeyValid");
        sessionStorage.removeItem("ParcelIndex");
        sessionStorage.removeItem("BillingIndex");
        sessionStorage.removeItem("ShippingIndex");
      })
      .catch((error) => {
        console.log(error);
      });
  }
});
