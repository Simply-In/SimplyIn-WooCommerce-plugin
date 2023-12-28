import { useState, useEffect } from 'react'
import { useInsertFormData } from '../../hooks/useInsertFormData'
import Modal from '@mui/material/Modal';
import Step1 from './steps/Step1'
import Step2 from './steps/Step2';
import { CloseContainer, PopupContainer, PopupHeader, StyledBox } from './SimplyID.styled';
import { CloseIcon } from '../../assets/CloseIcon';
import { SimplyinSmsPopupOpenerIcon } from '../../assets/SimplyinSmsPopupOpenerIcon';




interface IPinCodePopup {
	phoneNumber: string
	visible: boolean
	setVisible: (arg: boolean) => void
	setToken: any,
	simplyInput: string

}

let WPformElements: { name: string, value: string }[]
(function ($) {
	'use strict';
	WPformElements = $('form.checkout').serializeArray()
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
})(jQuery);


export const PinCodeModal = ({ phoneNumber, visible, setVisible, setToken, simplyInput,
}: IPinCodePopup) => {

	const [userData, setUserData] = useState({})
	const [modalStep, setModalStep] = useState(1)
	const [selectedUserData, setSelectedUserData] = useState({})
	const [editItemIndex, setEditItemIndex] = useState<{ property: string, itemIndex: number, isNewData?: boolean } | null>(null)

	useEffect(() => {
		setSelectedUserData({
			...userData,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			billingAddresses: userData?.billingAddresses?.length ? userData?.billingAddresses[0] : {},
			shippingAddresses: null,
			parcelLockers: null
		})
	}, [userData])

	useEffect(() => {
		setModalStep(1)
	}, [phoneNumber])

	useEffect(() => {
		setToken("")
		setUserData({})
		setModalStep(1)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [simplyInput])


	const handleClosePopup = () => {
		setVisible(false)
	}


	//funkcja wybierająca
	useInsertFormData(selectedUserData, WPformElements)

	return (<>
		{phoneNumber && <Modal
			open={visible}
			onClose={() => setVisible(false)}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<StyledBox id="containerSimply"
				style={{ maxWidth: editItemIndex?.property === "parcelLockers" ? "650px" : "400px" }}

			>
					<PopupHeader>

					<SimplyinSmsPopupOpenerIcon style={{ marginBottom: "12px" }} />
						<CloseContainer onClick={handleClosePopup}>
							<CloseIcon />
						</CloseContainer>
					</PopupHeader>
				<PopupContainer>
					{modalStep === 1 &&
						<Step1
							setToken={setToken}
							phoneNumber={phoneNumber}
							handleClosePopup={handleClosePopup}
							setModalStep={setModalStep}
							setUserData={setUserData}
							setSelectedUserData={setSelectedUserData} />}
					{modalStep === 2 &&
						<Step2
							handleClosePopup={handleClosePopup}
							userData={userData}
							setUserData={setUserData}
							setSelectedUserData={setSelectedUserData}
							editItemIndex={editItemIndex}
							setEditItemIndex={setEditItemIndex}

						/>}
				</PopupContainer>
			</StyledBox>
		</Modal>
		}</>
	)
}

export default PinCodeModal
