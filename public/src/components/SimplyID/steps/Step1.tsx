/* eslint-disable no-constant-condition */
import { useContext, useEffect, useState } from 'react'
import Countdown from 'react-countdown'
import { PopupTitle, PopupTextMain, PinInputContainer, PopupTextSecondary, PopupCountDownContainer, PopupCodeNotDelivered, PopupSendAgain, CounterSpan, MobileSystemsLinksContainer, SingleSystemLink } from '../SimplyID.styled'
import { middlewareApi } from '../../../services/middlewareApi'
import { PopupTextError } from '../../PhoneField/PhoneField.styled'
import { removeDataSessionStorage, saveDataSessionStorage } from '../../../services/sessionStorageApi'
import { CounterContext, SelectedDataContext, TypedLoginType } from '../SimplyID'
import { OtpInput as OtpInputReactJS } from 'reactjs-otp-input'
import { Divider, Link } from '@mui/material'

// import { AndroidIcon } from '../../../assets/AndroidIcon'
import { IosIcon } from '../../../assets/IosIcon'

import { useTranslation } from "react-i18next";
import { predefinedFill } from './functions'

const countdownRenderer = ({ formatted: { minutes, seconds } }: any) => {
	return <CounterSpan>{minutes}:{seconds}</CounterSpan>;
};

const countdownTimeSeconds = 30

const shortLang = (lang: string) => lang.substring(0, 2).toUpperCase();

interface IStep1 {
	handleClosePopup: () => void;
	phoneNumber: string;
	setModalStep: (arg: number) => void;
	setUserData: any
	setToken: any
	setSelectedUserData: any
	simplyInput: string
	loginType: TypedLoginType
	setLoginType: any
	setNotificationTokenId: any


}
export const getLangBrowser = () => {
	if (navigator.languages !== undefined) return navigator.languages[0];
	else return navigator.language;
};

// eslint-disable-next-line react-refresh/only-export-components
export const changeInputValue = (inputElement: any, newValue: any) => {
	const event = new Event("input", { bubbles: true });
	inputElement.value = newValue;
	inputElement.dispatchEvent(event);
}
// eslint-disable-next-line react-refresh/only-export-components
export const simplyinTokenInputField = document.getElementById('simplyinTokenInput')

export const Step1 = ({ handleClosePopup, phoneNumber, setModalStep, setUserData, setToken, setSelectedUserData, simplyInput, loginType, setLoginType, setNotificationTokenId
}: IStep1) => {
	const { t, i18n } = useTranslation();

	const [pinCode, setPinCode] = useState('');
	const [codeByEmail, setCodeByEmail] = useState(false)
	const [isCodeResended, setIsCodeResended] = useState(false)

	const {
		setSelectedBillingIndex,
		setSelectedShippingIndex,
		setSelectedDeliveryPointIndex,
		setSameDeliveryAddress,
		setPickupPointDelivery
	} = useContext(SelectedDataContext)

	const {
		countdown,
		setCountdown,
		countdownError,
		setCountdownError,
		errorPinCode,
		setErrorPinCode,
		modalError,
		setModalError,
		countdownTime,
		setCountdownTime,
		countdownTimeError,
		setCountdownTimeError
	} = useContext(CounterContext)

	//validating pin code function
	// auto fill without opening for modal for specific cases 
	const handlePinComplete = (value: string) => {
		middlewareApi({
			endpoint: "checkout/submitCheckoutCode",
			method: 'POST',
			requestBody: {
				"code": value,
				email: simplyInput,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				// lng: "DE",

				lng: shortLang(i18n.language) || shortLang(appLocalizer?.language) || shortLang(getLangBrowser()),
			}
		}).then(async (res: any) => {

			setModalError("")
			setErrorPinCode("")

			if (res?.code === "TOO_MANY_REQUESTS") {
				const match = res?.message.match(/\d+/);

				// Check if a number is found
				if (match) {
					const number = match[0] || undefined;

					if (number && typeof (+number) === "number") {
						setCountdownTimeError(Date.now() + +number * 1000)
						setCountdownError(true)
						setErrorPinCode(res?.message.replace(match[0], "").trim(""))
					}
					return
				}
			}

			if (res?.isCodeValid === false) {
				setModalError(t('modal-step-1.codeInvalid'))
				throw new Error(res?.message)

			} else if (res?.data) {

				if (res.data?.language) {
					i18n.changeLanguage(res.data?.language.toLowerCase())
				}

				const newData = { ...res.data }
				if (newData?.createdAt) {
					delete newData.createdAt
				}
				if (newData?.updatedAt) {
					delete newData.updatedAt
				}

				setUserData(newData)
				saveDataSessionStorage({ key: 'UserData', data: res.data })
				saveDataSessionStorage({ key: 'simplyinToken', data: res.authToken })
				removeDataSessionStorage({ key: 'phoneToken' })
				setToken(res.authToken)
				changeInputValue(simplyinTokenInputField, res.authToken);

				setModalStep(2)
				predefinedFill(res.data, handleClosePopup, {
					setSelectedBillingIndex,
					setSelectedShippingIndex,
					setSelectedDeliveryPointIndex,
					setSameDeliveryAddress,
					setPickupPointDelivery,
					setSelectedUserData
				})


			}
		});
	};

	useEffect(() => {
		if (pinCode?.length > 3) {
			handlePinComplete(pinCode)
		}
		setModalError("")

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pinCode])


	type sendPinAgainMethodType = "sms" | "email"

	//send ping again execution
	const handleSendPinAgain = ({ method }: { method: sendPinAgainMethodType }) => {
		setLoginType("pinCode")
		setNotificationTokenId("")
		setCountdown(true)
		setCountdownTime(Date.now() + countdownTimeSeconds * 1000)
		setPinCode("")
		setIsCodeResended(true)

		if (method === "email") {
			setCodeByEmail(true)
			middlewareApi({
				endpoint: "checkout/resend-checkout-code-via-email",
				method: 'POST',
				requestBody: { "email": simplyInput, language: shortLang(i18n.language) }
			}).catch((err) => {
				console.log(err);
			})
		}
		if (method === "sms") {
			setCodeByEmail(false)

			middlewareApi({
				endpoint: "checkout/submitEmail",
				method: 'POST',
				requestBody: { "email": simplyInput.trim().toLowerCase(), forceSms: true, language: shortLang(i18n.language) }

			}).catch((err) => {
				console.log(err);
			})
		}

	}

	const handleCountdownCompleted = () => {
		setCountdown(false)
	}

	const handleCountdownErrorCompleted = () => {
		setCountdownError(false)
		setErrorPinCode("")
	}


	useEffect(() => {

		const inputElement = document.querySelectorAll('#OTPForm input') as NodeListOf<HTMLInputElement>

		if (inputElement[0]) {
			inputElement[0].blur();
			setTimeout(() => {
				inputElement[0].focus()
			}, 300)
		}

		inputElement.forEach((el) => {
			el.pattern = "\\d*"
			el.inputMode = "numeric"
			el.type = "text"
			el.ariaRequired = "false"
		})


	}, [phoneNumber])




	return (
		<>
			<PopupTitle style={{ margin: loginType === "pinCode" ? "inherit" : "4px auto 12px" }}>	{t('modal-step-1.confirm')}</PopupTitle>

			{loginType === "pinCode" &&
				<>
				<PopupTextMain> {codeByEmail ? t('modal-step-1.insertCodeEmail') : t('modal-step-1.insertCode')} </PopupTextMain>
				<PopupTextMain> {codeByEmail ? simplyInput : phoneNumber} </PopupTextMain>
				<PinInputContainer  >
					<div>
						<form id="OTPForm">
							<OtpInputReactJS
								value={pinCode}
								onChange={setPinCode}
								numInputs={4}
								isDisabled={countdownError ? true : false}
								inputStyle={{
									width: "40px",
									height: "56px",
										border: modalError ? "1px solid red" : countdownError ? "1px solid #FFD3D3" : "1px solid #D9D9D9",
										borderRadius: "8px",
										fontSize: "30px",
										textAlign: "center",
										padding: 0,
										outlineWidth: "0px",

								}}
								isInputNum={true}
								shouldAutoFocus={true}
								renderInput={
									(props: any, id: any) =>
										<input
											{...props}
											type="number"
											pattern="\d*"
											autoComplete='one-time-code'
											id={`otp-input-${id + 1}`}
											inputMode='numeric' />
								}
								inputType='numeric'
								inputMode='numeric'
								pattern="\d*"


							/>

						</form>
					</div>

				</PinInputContainer>
				{countdownError ?
					<PopupCountDownContainer color={"#E52424"}>
						<PopupCodeNotDelivered color={"#E52424"} marginTop='0px'>
							{errorPinCode}
						</PopupCodeNotDelivered>
						<Countdown
							daysInHours={false}
							renderer={countdownRenderer}
							zeroPadTime={2}
							zeroPadDays={2}
							date={countdownTimeError}
							onComplete={handleCountdownErrorCompleted}
						/>
					</PopupCountDownContainer>
					:
					null}

				</>
			}
			{loginType === "app" &&

				<PopupTextMain>
					{t('modal-step-1.checkInApp')}
				</PopupTextMain>

			}
			{modalError && <PopupTextError >
				{modalError}
			</PopupTextError>
			}




			<PopupTextSecondary style={{ paddingBottom: loginType === "app" ? '24px' : "inherit" }}>
				{t('modal-step-1.editAfterLogin')}
			</PopupTextSecondary>

			<> {

				(countdown) ?

					<PopupCountDownContainer color={"#E52424"}>
						<PopupCodeNotDelivered color={"#E52424"} marginTop='0px'>
							{loginType === "app" ? t('modal-step-1.codeHasBeenSent') : t('modal-step-1.codeHasBeenSentAgain')}
						</PopupCodeNotDelivered>

						<Countdown daysInHours={false} renderer={countdownRenderer} zeroPadTime={2} zeroPadDays={2}
							date={countdownTime} onComplete={handleCountdownCompleted} />
					</PopupCountDownContainer>

					:
					<div>
						<PopupCodeNotDelivered>
							{loginType === "app" ? t('modal-step-1.noAccessToMobile') : t('modal-step-1.codeNotArrived')}
						</PopupCodeNotDelivered>

						{!isCodeResended ?
							<PopupSendAgain disabled={!!countdownError}>
								<Link
									disabled={!!countdownError}
									component="button"
									id="send-again-btn"
									underline={countdownError ? "none" : "hover"}
									onClick={() => handleSendPinAgain({ method: "sms" })}
								>
									{loginType === "app" ? t('modal-step-1.sendViaSMS') : t('modal-step-1.sendAgain')}
								</Link>
								&nbsp; {t('modal-step-1.or')} &nbsp;
								<Link
									disabled={!!countdownError}
									component="button"
									id="send-again-email-btn"
									value="mail"
									onClick={() => handleSendPinAgain({ method: "email" })}
									underline={countdownError ? "none" : "hover"}
								>
									{t('modal-step-1.sendViaEmail')}
								</Link>
							</PopupSendAgain>
							:

							<>
								{
									codeByEmail
										?

										<PopupSendAgain disabled={!!countdownError}>
											<Link
												disabled={!!countdownError}
												component="button"
												id="send-again-btn"
												underline={countdownError ? "none" : "hover"}
												onClick={() => handleSendPinAgain({ method: "email" })}
											>
												{t('modal-step-1.sendAgain')}
											</Link>
											&nbsp; {t('modal-step-1.or')} &nbsp;
											<Link
												disabled={!!countdownError}
												component="button"
												id="send-again-email-btn"
												value="mail"
												onClick={() => handleSendPinAgain({ method: "sms" })}
												underline={countdownError ? "none" : "hover"}
											>
												{t('modal-step-1.sendViaSMS')}
											</Link>
										</PopupSendAgain>
										:
										<PopupSendAgain disabled={!!countdownError}>
											<Link
												disabled={!!countdownError}
												component="button"
												id="send-again-btn"
												underline={countdownError ? "none" : "hover"}
												onClick={() => handleSendPinAgain({ method: "sms" })}
											>
												{t('modal-step-1.sendAgain')}
											</Link>
											&nbsp; {t('modal-step-1.or')} &nbsp;
											<Link
												disabled={!!countdownError}
												component="button"
												id="send-again-email-btn"
												value="mail"
												onClick={() => handleSendPinAgain({ method: "email" })}
												underline={countdownError ? "none" : "hover"}
											>
												{t('modal-step-1.sendViaEmail')}
											</Link>
										</PopupSendAgain>	


								}





							</>
						}



					</div>}
			</>

			{loginType === "pinCode" &&
				<>
					<Divider style={{ marginTop: 24, marginBottom: 12 }} />
				<PopupTextSecondary>
					Loguj się za pomocą aplikacji. Pobierz teraz.
				</PopupTextSecondary>
				<MobileSystemsLinksContainer>
					{/* <SingleSystemLink target="_blank" href='#'><AndroidIcon />Android</SingleSystemLink> */}
					<SingleSystemLink target="_blank" href='https://apps.apple.com/pl/app/simply-in/id6476778468?l=pl'><IosIcon />iOS</SingleSystemLink>
					</MobileSystemsLinksContainer>
				</>}
		</>
	)
}

export default Step1