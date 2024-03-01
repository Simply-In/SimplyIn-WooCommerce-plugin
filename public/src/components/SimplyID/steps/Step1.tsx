/* eslint-disable no-constant-condition */
import { useContext, useEffect, useState } from 'react'
import Countdown from 'react-countdown'
import { PopupTitle, PopupTextMain, PinInputContainer, PopupTextSecondary, PopupCountDownContainer, PopupCodeNotDelivered, PopupSendAgain } from '../SimplyID.styled'
import { middlewareApi } from '../../../services/middlewareApi'
import { PopupTextError } from '../../PhoneField/PhoneField.styled'
import { removeDataSessionStorage, saveDataSessionStorage } from '../../../services/sessionStorageApi'
import { SelectedDataContext } from '../SimplyID'
import { OtpInput as OtpInputReactJS } from 'reactjs-otp-input'
import { Link } from '@mui/material'
import { selectPickupPointInpost } from '../../../functions/selectInpostPoint'
import { useTranslation } from "react-i18next";

const countdownRenderer = ({ formatted: { minutes, seconds } }: any) => {
	return <span>{minutes}:{seconds}</span>;
};
const countdownTimeSeconds = 10

interface IStep1 {
	handleClosePopup: () => void;
	phoneNumber: string;
	setModalStep: (arg: number) => void;
	setUserData: any
	setToken: any
	setSelectedUserData: any
	simplyInput: string
}
// eslint-disable-next-line react-refresh/only-export-components
export const changeInputValue = (inputElement: any, newValue: any) => {
	const event = new Event("input", { bubbles: true });
	inputElement.value = newValue;
	inputElement.dispatchEvent(event);
}
// eslint-disable-next-line react-refresh/only-export-components
export const simplyinTokenInputField = document.getElementById('simplyinTokenInput')

export const Step1 = ({ handleClosePopup, phoneNumber, setModalStep, setUserData, setToken, setSelectedUserData, simplyInput }: IStep1) => {
	const { t } = useTranslation();

	const [countdown, setCountdown] = useState<boolean>(false)
	const [countdownTime, setCountdownTime] = useState<number>(0)
	const [modalError, setModalError] = useState("")
	const [pinCode, setPinCode] = useState('');
	const {
		setSelectedBillingIndex,
		setSelectedShippingIndex,
		setSelectedDeliveryPointIndex,
		setSameDeliveryAddress,
		setPickupPointDelivery
	} = useContext(SelectedDataContext)


	//validating pin code function
	// auto fill without opening for modal for specific cases 
	const handlePinComplete = (value: string) => {
		middlewareApi({
			endpoint: "checkout/submitCheckoutCode",
			method: 'POST',
			requestBody: { "code": value }
		}).then(async (res) => {
			console.log(res);
			setModalError("")
			if (!res?.data || res?.message === "Code doesnt exist" || res?.message === "INTERNAL_SERVER_ERROR") {
				setModalError(t('modal-step-1.codeInvalid'))
				throw new Error(res.message)

			} else if (res.data) {


				console.log('DATA', res.data);

				setUserData({ ...res.data })
				saveDataSessionStorage({ key: 'UserData', data: res.data })
				saveDataSessionStorage({ key: 'simplyinToken', data: res.authToken })
				removeDataSessionStorage({ key: 'phoneToken' })
				setToken(res.authToken)
				changeInputValue(simplyinTokenInputField, res.authToken);

				const { billingAddresses, shippingAddresses, parcelLockers } = res.data

				if (billingAddresses.length === 0) {
					setModalStep(2)
					return
				}

				if (billingAddresses.length === 1 && shippingAddresses.length === 1 && parcelLockers.length === 0) {

					setSelectedBillingIndex(0)
					setSelectedShippingIndex(0)
					setSelectedDeliveryPointIndex(null)

					sessionStorage.setItem("BillingIndex", `0`)
					sessionStorage.setItem("ShippingIndex", `null`)
					sessionStorage.setItem("ParcelIndex", `0`)

					setSameDeliveryAddress(false)
					setSelectedUserData((prev: any) => {
						return ({
							...prev,
							billingAddresses: billingAddresses[0],
							shippingAddresses: shippingAddresses[0],
							parcelLockers: null
						})
					})

					handleClosePopup()
					setModalStep(2)
					return
				}
				if (billingAddresses.length === 1 && shippingAddresses.length && parcelLockers.length === 0) {


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
					setModalStep(2)
					return
				}

				if (billingAddresses.length === 1 && shippingAddresses.length === 0 && parcelLockers.length === 0) {


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

					setModalStep(2)
					handleClosePopup()
					return
				}
				if (billingAddresses.length === 1 && shippingAddresses.length === 0 && parcelLockers.length === 1) {

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
					setModalStep(2)
					handleClosePopup()
					return
				}

				if (billingAddresses.length === 1 && shippingAddresses.length === 0 && parcelLockers.length) {
					setSelectedBillingIndex(0)
					setSelectedShippingIndex(null)
					setSelectedDeliveryPointIndex(0)
					sessionStorage.setItem("BillingIndex", `0`)
					sessionStorage.setItem("ShippingIndex", `null`)
					sessionStorage.setItem("ParcelIndex", `0`)
					console.log('delivery point index selection');
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

					setModalStep(2)
					return
				}
				setModalStep(2)
			}
		});
	};

	useEffect(() => {
		if (pinCode?.length > 3) {
			handlePinComplete(pinCode)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pinCode])


	// type sendPinAgainMethodType = "sms" | "email"


	//send ping again execution
	const handleSendPinAgain = () => {
		setCountdown(true)
		setCountdownTime(Date.now() + countdownTimeSeconds * 1000)

		middlewareApi({
			endpoint: "checkout/resend-checkout-code-via-email",
			method: 'POST',
			requestBody: { "email": simplyInput }
		}).catch((err) => {

			console.log(err);

		})

	}

	const handleCountdownCompleted = () => {
		setCountdown(false)
	}


	useEffect(() => {

		const inputElement = document.querySelectorAll('#OTPForm input') as NodeListOf<HTMLInputElement>

		if (inputElement[0]) {
			inputElement[0].blur();

		}
		inputElement.forEach((el) => {
			el.pattern = "\\d*"
			el.inputMode = "numeric"
		})


	}, [phoneNumber])



	return (
		<>
			<PopupTitle>	{t('modal-step-1.confirm')}</PopupTitle>
			<PopupTextMain> {t('modal-step-1.insertCode')} </PopupTextMain>
			<PopupTextMain> {phoneNumber} </PopupTextMain>

			<PinInputContainer  >
				<div>
					<form id="OTPForm">
						<OtpInputReactJS
							value={pinCode}
							onChange={setPinCode}
							numInputs={4}

							inputStyle={{
								width: "40px",
								height: "56px",
								border: "1px solid #D9D9D9",
								borderRadius: "8px",
								fontSize: "30px",
								textAlign: "center",
								padding: 0

							}}
							isInputNum={true}
							shouldAutoFocus="false"
							renderInput={(props: any, id: any) => <input {...props} type="number" pattern="\d*" autoComplete='one-time-code' id={`otp-input-${id + 1}`} inputMode='numeric' />}
							inputType='numeric'
							pattern="\d*"
						/>

					</form>
				</div>

			</PinInputContainer>


			<PopupTextError >
				{modalError}
			</PopupTextError>
			<PopupTextSecondary>
				{t('modal-step-1.editAfterLogin')}
			</PopupTextSecondary>

			{(countdown) ?

				<PopupCountDownContainer>
					<PopupCodeNotDelivered>
						{t('modal-step-1.codeHasBeenSent')}
					</PopupCodeNotDelivered>

					<Countdown daysInHours={false} renderer={countdownRenderer} zeroPadTime={2} zeroPadDays={2}
						date={countdownTime} onComplete={handleCountdownCompleted} />
				</PopupCountDownContainer>

				:
				<>
					<PopupCodeNotDelivered>
						{t('modal-step-1.codeNotArrived')}
					</PopupCodeNotDelivered>
					<PopupSendAgain>

						<Link
							component="button"
							id="send-again-email-btn"
							value="mail"
							onClick={handleSendPinAgain}
							underline="hover"
						>
							{t('modal-step-1.sendViaEmail')}
						</Link>
					</PopupSendAgain>
				</>
			}

			{/* <Divider style={{ marginTop: 24, marginBottom: 12 }} />
			<PopupTextSecondary>
				Loguj się za pomocą aplikacji. Pobierz teraz.
			</PopupTextSecondary>
			<MobileSystemsLinksContainer>
				<SingleSystemLink href='#'><AndroidIcon />Android</SingleSystemLink>
				<SingleSystemLink href='#'><IosIcon />iOS</SingleSystemLink>
			</MobileSystemsLinksContainer> */}
		</>
	)
}

export default Step1