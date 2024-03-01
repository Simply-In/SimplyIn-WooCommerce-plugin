import axios from "axios";
import { saveDataLocalStorage } from "../services/sessionStorageApi";


//get inpost data from inpost endpoint
export const getInpostPointData = async ({ deliveryPointID }: IselectIPickupPointInpost) => {
	try {
		const res = await axios(`https://api-pl-points.easypack24.net/v1/points/${deliveryPointID}`);
		const pointData = res.data;

		return pointData

	} catch (error) {
		console.error('Error:', error);
		return false
	}
}

interface IselectIPickupPointInpost {
	deliveryPointID: string
}
interface IselectIPickupPointInpost {
	deliveryPointID: string
}

//function for selecting pickup point in inpost extension
export const selectPickupPointInpost = async ({ deliveryPointID }: IselectIPickupPointInpost) => {
	if (!deliveryPointID) { return }
	const inpostPointData = await getInpostPointData({ deliveryPointID: deliveryPointID })
	if (!inpostPointData.name) {
		console.log('Selected shipping point is invalid')
		return;
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	let isFunctionCalled = false

	saveDataLocalStorage({
		key: 'EasyPackPointObject',
		data: {
			pointName: inpostPointData?.name || deliveryPointID || "",
			pointDesc: inpostPointData?.address?.line1 || "",
			pointAddDesc: inpostPointData?.location_description || ""
		}
	});


	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	(function ($) {

		$(document).ready(
			function () {
				$(document.body).on(
					'updated_checkout',
					function () {
						if (isFunctionCalled) {
							console.log('function has been allready called');
							return
						}
						isFunctionCalled = true;
						const inputs = document.querySelectorAll('input[value^="easypack_parcel_machines"]');

						// Filter the selected inputs to include only those that end with numbers only
						const filteredInputs = Array.from(inputs).filter(input => {
							const name = input.getAttribute('value');
							console.log(name);
							return /^easypack_parcel_machines:\d+$/.test(name as string);
						});

						if (filteredInputs?.[0]) {
							const inpostLabel = (filteredInputs[0]?.parentNode as any)?.querySelector('label')

							inpostLabel.click();
							const event = new Event("label", { bubbles: true });
							inpostLabel.dispatchEvent(event);
						}

					}
				);
			}
		);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
	})(jQuery);

}
//function for reseting delivery method
export const resetDeliveryMethod = () => {

	let isFunctionCalled = false;
	(function ($) {
		$(document).ready(
			function () {
				$(document.body).on(
					'updated_checkout',
					function () {
						if (isFunctionCalled) {
							console.log('function has been allready called');
							return
						}
						isFunctionCalled = true;
						const inputs = document.querySelectorAll('#shipping_method li>input ');

						if (inputs?.[0]) {
							const inpostLabel = (inputs[0].parentNode as any)?.querySelector('label')

							inpostLabel.click();
							const event = new Event("label", { bubbles: true });
							inpostLabel.dispatchEvent(event);
						}

					}
				);
			}
		);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
	})(jQuery);

}


