import placeholder from '../../../assets/placeholder.png';

//importing placeholder icon
export const getPlaceholder = () => {
	return placeholder
}


type addressType = { [key: string]: string }

type isSameShippingAndBillingAddressesType = {
	billingAddress: addressType,
	shippingAddress: addressType,
}

export const isSameShippingAndBillingAddresses = ({ billingAddress, shippingAddress }: isSameShippingAndBillingAddressesType): boolean => {

	const comparingKeys = Object.keys(shippingAddress || {}).filter((key) => key !== "_id")

	for (const key of comparingKeys) {
		if (shippingAddress[key] !== billingAddress[key]) {
			return false
		}
	}
	return true
}
