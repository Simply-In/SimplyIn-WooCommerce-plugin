import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Button } from '@mui/material'
import { useContext, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from "react-i18next";
import { ApiContext } from '../../SimplyID';
import { middlewareApi } from '../../../../services/middlewareApi';

interface IEditFormAddress {
	control: any
	errors: any
	isBillingAddress: any
	countryListSelect: any
}



export const EditFormAddress = ({ control, errors, isBillingAddress, countryListSelect }: IEditFormAddress) => {
	const { t } = useTranslation();

	const apiToken = useContext(ApiContext)?.authToken;

	const methods = useFormContext()

	const { watch, setError, getValues, reset } = methods


	const nipField = watch('taxId')


	useEffect(() => {
		if (nipField?.length > 8) {
			console.log(nipField);
		}
	}, [nipField])


	const handleTaxIDClick = () => {

		const taxID = getValues("taxId")
		const normalizedTaxId = taxID.replace(/\D/g, '')
		const requestBody = { taxId: normalizedTaxId }
		middlewareApi({
			endpoint: `checkout/retrieveCompanyData` as any,
			method: 'POST',
			token: apiToken,
			requestBody: requestBody

		}).then(({ data }: any) => {


			if (!data) {
				setError("taxId", { "message": t("modal-form.NoTaxIdData") })
			}


			reset({ ...getValues(), taxID: normalizedTaxId, companyName: data?.companyName, state: data?.state, city: data?.city, street: `${data?.street || ""} ${data?.buildingNumber || ""}`, appartmentNumber: data?.apartmentNumber, postalCode: data?.postalCode })


		})


	}

	const values = getValues()


	return (
		<>
			<Grid item xs={12}>
				<Controller
					name="addressName"
					control={control}
					render={({ field }) =>
						<TextField  {...field} label={t('modal-form.addressNamePlaceholder')} fullWidth error={!!errors.addressName} helperText={errors?.addressName?.message} value={values.addressName || ""} />
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="name"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.name')} fullWidth error={!!errors.name} helperText={errors?.name?.message} value={values.name || ""} />
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="surname"
					control={control}
					render={({ field }) =>

						<TextField {...field} label={t('modal-form.surname')} fullWidth error={!!errors.surname} helperText={errors?.surname?.message} value={values.surname || ""} />
					}
				/>
			</Grid>
			<Grid item xs={12}>
				<Controller
					name="companyName"
					control={control}
					render={({ field }) =>
						<TextField {...field}
							label={t('modal-form.companyName')}
							fullWidth
							error={!!errors.companyName}
							helperText={errors?.companyName?.message}

							value={values.companyName || ""}

						/>
					}
				/>
			</Grid >
			{isBillingAddress &&
				<Grid item xs={12}>
					<FormControl fullWidth error={!!errors.taxId}>
						<div style={{ display: "flex", alignItems: "center" }}>

							<Controller
								name="taxId"
								control={control}

								defaultValue="" // Make sure to set defaultValue for controlled components
								render={({ field }) => (
									<TextField
										{...field}
										type="text"
										label={t('modal-form.taxId')}
										fullWidth
										error={!!errors.taxId}
										inputProps={{
											inputMode: 'numeric',
										}}
										onChange={(e) => {
											const value = e.target.value;
											// Only allow numbers, spaces, and dashes
											const filteredValue = value.replace(/[^0-9-\s]/g, '');
											field.onChange(filteredValue); // update field value
										}}
										value={field.value} // controlled value from form
									// helperText={errors?.taxId?.message}
									/>
								)}
							/>


							<Button

								style={{
									padding: "0px 16px",
									marginLeft: "8px",
									border: "1px solid rgb(0, 0, 0, 0.23)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									borderRadius: "4px",
									cursor: "pointer",
									color: "#FFFFFF",
									backgroundColor: "rgb(25, 118, 210)",
									textAlign: "center",
								}}
								onClick={handleTaxIDClick}
							>
								{t('modal-form.getTaxIdData')}

							</Button>


						</div>
						{errors?.taxId && (
							<FormHelperText>{errors.taxId.message}</FormHelperText>
						)}
					</FormControl>
				</Grid>
			}
			<Grid item xs={12}>
				<Controller
					name="street"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.streetAndNumber')} fullWidth error={!!errors.street} helperText={errors?.street?.message} value={values.street || ""} />
					}
				/>
			</Grid>
			<Grid item xs={12}>
				<Controller
					name="appartmentNumber"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.appartment')} fullWidth error={!!errors.appartmentNumber} helperText={errors?.appartmentNumber?.message} value={values.appartmentNumber || ""} />
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="postalCode"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.postalCode')} fullWidth error={!!errors.postalCode} helperText={errors?.postalCode?.message} value={values.postalCode || ""} />
					}
				/>
			</Grid>
			<Grid item xs={6}>
				<Controller
					name="city"
					control={control}
					render={({ field }) =>
						<TextField {...field} label={t('modal-form.city')} fullWidth error={!!errors.city} helperText={errors?.city?.message} value={values.city || ""} />
					}
				/>
			</Grid>
			<Grid item xs={12} style={{ marginBottom: "16px" }}>
				<FormControl fullWidth error={errors.country}>
					<Controller
						render={({ field }) =>
							<>
								<InputLabel id="country-label">{t('modal-form.country')}</InputLabel>
								<Select labelId="country-label" {...field} label={t('modal-form.country')}  >

									{countryListSelect?.map((item: any) => (
										<MenuItem key={item.code} value={item.code}>
											{t(`countries.${item.code}`)}
										</MenuItem>
									))}
								</Select >
								<FormHelperText>{errors?.country?.message}</FormHelperText>
							</>
						}

						name="country"
						control={control}
					/>
				</FormControl>
			</Grid>

		</>
	)
}
