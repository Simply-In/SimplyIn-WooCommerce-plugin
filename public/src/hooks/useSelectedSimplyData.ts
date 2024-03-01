import { useState } from 'react';

//hook used for storing and providing account addresses data
export const useSelectedSimplyData = () => {

	const [selectedBillingIndex, setSelectedBillingIndex] = useState(0);
	const [selectedShippingIndex, setSelectedShippingIndex] = useState<number | null>(null);
	const [selectedDeliveryPointIndex, setSelectedDeliveryPointIndex] = useState<number | null>(null)
	const [sameDeliveryAddress, setSameDeliveryAddress] = useState<boolean>(true);
	const [pickupPointDelivery, setPickupPointDelivery] = useState<boolean>(false);

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
		setPickupPointDelivery
	};
} 