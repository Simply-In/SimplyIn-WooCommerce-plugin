import { Grid, TextField } from '@mui/material'
import { useContext } from 'react'

import { EditFormTitle } from '../../SimplyID.styled';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { ApiContext } from '../../SimplyID';

import { middlewareApi } from '../../../../services/middlewareApi';
import { saveDataSessionStorage } from '../../../../services/sessionStorageApi';

import { EditFormFooter } from './EditFormFooter';

import { useTranslation } from "react-i18next";



declare global {
	interface Window {
		afterPointSelected: (point: any) => void;
		querySelector: any
	}
}



interface IStep2PaymentForm {
	setUserData: any
	editItem: { property: string, itemIndex: number, editData: any } | null
	setEditItemIndex: (arg: { property: string, itemIndex: number } | null) => void
	isNewData?: boolean
	userData: any
	selectedPaymentIndex: any
	setSelectedPaymentIndex: any
}

//editing/adding address form
export const Step2PaymentForm = ({
	userData,
	setUserData,
	editItem,
	setEditItemIndex,
	isNewData,


}: IStep2PaymentForm) => {
	const { t } = useTranslation();

	const PaymentFormSchema = Yup.object({
		cardName: Yup.string().required(t('modal-form.paymentMethodNameRequired')),
		cardProvider: Yup.string().required(),
		cardNumberLastDigits: Yup.string(),
		_id: Yup.string(),
		cardToken: Yup.string(),


	});


	const apiToken = useContext(ApiContext)?.authToken;


	const { editData }: any = editItem

	const methods = useForm({
		resolver: yupResolver(PaymentFormSchema),
		defaultValues: {
			_id: editData?._id || undefined,
			cardName: editData?.cardName || "",
			cardNumberLastDigits: `${editData?.cardNumberLastDigits}`,
			cardProvider: editData.cardProvider || "",
			cardToken: editData.cardToken

		}
	});

	const { control, handleSubmit, formState: { errors } } = methods;

	const onSubmit = (data: any) => {
		console.log(data);
		Object.keys(data).forEach(key => {
			if (typeof data[key] === 'string') {
				data[key] = data[key].trim();
			}
		})
		handleSave(data)
	}


	const handleCancel = () => { setEditItemIndex(null) }




	//saving address data function
	const handleSave = (editedData: any) => {

		if (editItem && 'property' in editItem && 'itemIndex' in editItem) {

			const clonnedArray = [...userData[editItem.property]]
			clonnedArray[editItem?.itemIndex] = {
				...editedData
			}
			const requestData = { userData: { ...userData, [editItem.property]: clonnedArray } }
			middlewareApi({
				endpoint: "userData",
				method: 'PATCH',
				token: apiToken,
				requestBody: requestData
			}).then(res => {
				if (res.error) {
					throw new Error(res.error)
				} else if (res.data) {

					const newData = { ...res.data }
					if (newData?.createdAt) {
						delete newData.createdAt
					}
					if (newData?.updatedAt) {
						delete newData.updatedAt
					}

					setUserData(newData)
					saveDataSessionStorage({ key: 'UserData', data: newData })


				}
			})
		}

		setEditItemIndex(null)
	}








	return (
		<div >
			<FormProvider {...methods}>
				<EditFormTitle>{t('modal-form.paymentMethod')}</EditFormTitle>

				<form onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Controller
								name="cardName"
								control={control}
								render={({ field }) =>
									<TextField  {...field}
										label={t('modal-form.cardName')}
										fullWidth error={!!errors.cardName}
										helperText={errors?.cardName?.message}
										value={field.value}
										InputLabelProps={{ shrink: true }}
										onChange={(e) => {
											const value = e.target.value;
											field.onChange(value);
										}} />
								}
							/>
						</Grid>
						<Grid item xs={6}>
							<Controller
								name="cardProvider"
								control={control}
								render={({ field }) =>
									<TextField {...field} label={t('modal-form.cardProvider')} fullWidth error={!!errors.cardProvider} helperText={errors?.cardProvider?.message}
										value={field.value}
										disabled
										InputLabelProps={{ shrink: true }}
										onChange={(e) => {
											const value = e.target.value;
											field.onChange(value);
										}} />
								}
							/>
						</Grid>
						<Grid item xs={6} style={{ marginBottom: "16px" }}>
							<Controller
								name="cardNumberLastDigits"

								control={control}
								render={({ field }) =>

									<TextField {...field} label={t('modal-form.cardNumber')} fullWidth error={!!errors.cardNumberLastDigits} helperText={errors?.cardNumberLastDigits?.message}

										value={`**** **** **** ${field.value}`}
										InputLabelProps={{ shrink: true }}
										disabled
										onChange={(e) => {
											const value = e.target.value;
											field.onChange(value);
										}} />
								}
							/>
						</Grid>




					</Grid>
					<EditFormFooter
						isNewData={isNewData}
						handleCancel={handleCancel} />

				</form >
			</FormProvider>
		</div >
	)
}

