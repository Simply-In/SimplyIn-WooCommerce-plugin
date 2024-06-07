import placeholder from '../../../assets/placeholder.png';
import { selectPickupPointInpost } from '../../../functions/selectInpostPoint';

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



export const predefinedFill = (userData: any, handleClosePopup: any, indexContext: any) => {

	const {
		setSelectedBillingIndex,
		setSelectedShippingIndex,
		setSelectedDeliveryPointIndex,
		setSameDeliveryAddress,
		setPickupPointDelivery,
		setSelectedUserData

	} = indexContext

	const { billingAddresses, shippingAddresses, parcelLockers } = userData

	if (billingAddresses?.length === 0) {
		return
	}

	if (billingAddresses?.length === 1 && shippingAddresses?.length === 1 && parcelLockers?.length === 0) {

		let shippingElement = shippingAddresses[0]
		if (isSameShippingAndBillingAddresses({ billingAddress: billingAddresses[0], shippingAddress: shippingAddresses[0] })) {
			shippingElement = null
			setSelectedShippingIndex(null)
			sessionStorage.setItem("ShippingIndex", `null`)
			setSameDeliveryAddress(true)
		} else {
			setSelectedShippingIndex(0)
			sessionStorage.setItem("ShippingIndex", `0`)
			setSameDeliveryAddress(false)
		}

		setSelectedBillingIndex(0)
		setSelectedDeliveryPointIndex(null)

		sessionStorage.setItem("BillingIndex", `0`)
		sessionStorage.setItem("ParcelIndex", `null`)

		setSelectedUserData((prev: any) => {
			return ({
				...prev,
				billingAddresses: billingAddresses[0],
				shippingAddresses: shippingElement,
				parcelLockers: null
			})
		})

		handleClosePopup()

		return
	}



	if (billingAddresses?.length === 1 && shippingAddresses?.length && parcelLockers?.length === 0) {

		setSelectedBillingIndex(0)
		setSelectedShippingIndex(0)
		setSelectedDeliveryPointIndex(null)
		sessionStorage.setItem("BillingIndex", `0`)
		sessionStorage.setItem("ShippingIndex", `0`)
		sessionStorage.setItem("ParcelIndex", `null`)
		setSameDeliveryAddress(false)
		setSelectedUserData((prev: any) => {
			return ({
				...prev,
				billingAddresses: billingAddresses[0],
				shippingAddresses: shippingAddresses[0],
				parcelLockers: null
			})
		})

		return
	}

	if (billingAddresses?.length === 1 && shippingAddresses?.length === 0 && parcelLockers?.length === 0) {


		setSelectedBillingIndex(0)
		setSelectedShippingIndex(null)
		setSelectedDeliveryPointIndex(null)
		sessionStorage.setItem("BillingIndex", `0`)
		sessionStorage.setItem("ShippingIndex", `null`)
		sessionStorage.setItem("ParcelIndex", `null`)
		setSameDeliveryAddress(true)
		setSelectedUserData((prev: any) => {
			return ({
				...prev,
				billingAddresses: billingAddresses[0],
				shippingAddresses: null,
				parcelLockers: null
			})
		})

		handleClosePopup()
		return
	}
	if (billingAddresses?.length === 1 && shippingAddresses?.length === 0 && parcelLockers?.length === 1) {

		setSelectedBillingIndex(0)
		setSelectedShippingIndex(null)
		setSelectedDeliveryPointIndex(0)
		sessionStorage.setItem("BillingIndex", `0`)
		sessionStorage.setItem("ShippingIndex", `null`)
		sessionStorage.setItem("ParcelIndex", `0`)
		setSameDeliveryAddress(true)

		setSelectedUserData((prev: any) => {
			return ({
				...prev,
				billingAddresses: billingAddresses[0],
				shippingAddresses: null,
				parcelLockers: parcelLockers[0]

			})
		})
		selectPickupPointInpost({ deliveryPointID: parcelLockers[0].lockerId });

		handleClosePopup()
		return
	}

	if (billingAddresses?.length === 1 && shippingAddresses?.length === 0 && parcelLockers?.length) {
		setSelectedBillingIndex(0)
		setSelectedShippingIndex(null)
		setSelectedDeliveryPointIndex(0)
		sessionStorage.setItem("BillingIndex", `0`)
		sessionStorage.setItem("ShippingIndex", `null`)
		sessionStorage.setItem("ParcelIndex", `0`)

		setSameDeliveryAddress(true)
		setPickupPointDelivery(true)
		setSelectedUserData((prev: any) => {
			return ({
				...prev,
				billingAddresses: billingAddresses[0],
				shippingAddresses: null,
				parcelLockers: parcelLockers[0]

			})
		})


		return
	}


}