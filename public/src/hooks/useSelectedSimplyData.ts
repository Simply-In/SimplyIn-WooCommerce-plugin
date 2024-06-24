import { useState } from 'react';
import { TabType } from '../components/SimplyID/steps/Step2';

export type DeliveryType = "address" | "machine"

export const isNumber = (str: any) => {
	return !isNaN(str) && !isNaN(parseFloat(str));
}

//hook used for storing and providing account addresses data
export const useSelectedSimplyData = () => {
	const BillingIndex = (sessionStorage.getItem("BillingIndex") || 0) as number
	const ShippingIndex = sessionStorage.getItem("ShippingIndex") as number | null

	const ParcelIndex = sessionStorage.getItem("ParcelIndex") as number | null
	const SelectedTab = sessionStorage.getItem("SelectedTab") as TabType

	const [selectedBillingIndex, setSelectedBillingIndex] = useState(BillingIndex || 0);
	const [selectedShippingIndex, setSelectedShippingIndex] = useState<number | null>(ShippingIndex || null);
	const [selectedDeliveryPointIndex, setSelectedDeliveryPointIndex] = useState<number | null>(ParcelIndex || null)
	const [sameDeliveryAddress, setSameDeliveryAddress] = useState<boolean>(isNumber(ShippingIndex) ? false : true);
	const [pickupPointDelivery, setPickupPointDelivery] = useState<boolean>(false);
	const [selectedTab, setSelectedTab] = useState<TabType>(SelectedTab || "parcel_machine");
	const [deliveryType, setDeliveryType] = useState<DeliveryType>(isNumber(ShippingIndex) ? "address" : "machine");


	return {
		selectedBillingIndex,
		setSelectedBillingIndex,
		selectedShippingIndex,
		setSelectedShippingIndex,
		sameDeliveryAddress,
		setSameDeliveryAddress,
		selectedDeliveryPointIndex,
		setSelectedDeliveryPointIndex,
		pickupPointDelivery,
		setPickupPointDelivery,
		selectedTab,
		setSelectedTab,
		deliveryType,
		setDeliveryType
	};
} 