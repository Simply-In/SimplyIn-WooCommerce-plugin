import { CircularProgress, FormLabel, Grid, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

import { Controller } from 'react-hook-form'
import { loadDataFromSessionStorage, saveDataSessionStorage } from '../../../../services/sessionStorageApi'
import { AddressSearch } from './AddressSearch'
import { StyledTextField } from './components.styled'
import { useTranslation } from "react-i18next";


interface IEditFormMachine {
	control: any
	errors: any
	addressNameRef: any
	getValues: any
	additionalInfo: any
	setLockerIdValue: any
	setValue: any
	setAdditionalInfo: any
}



const currentUrl = window.location.href;

// Extract domain address using URL API
const urlObject = new URL(currentUrl);
const domain = urlObject.hostname;

// Set up the request configuration
const apiUrl = 'https://api.inpost.pl/v1/points';
const params = new URLSearchParams({
	limit: "1",
	relative_point: '52.229676,21.012229',
});

const config = {
	method: 'GET',
	headers: {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		'Authorization': `Bearer ${appLocalizer?.inpostApiKey || ""}`,
		// 'Authorization': `s`,
		"App-Referrer": domain,
	},
};

//edit machine component
export const EditFormMachine = ({
	control,
	errors,
	addressNameRef,
	getValues,
	additionalInfo,
	setLockerIdValue,
	setValue,
	setAdditionalInfo,

}: IEditFormMachine) => {
	const { t } = useTranslation();

	const [loading, setLoading] = useState(true)
	const [isMapVisible, setIsMapVisible] = useState(true)

	//checking if inpost key is valid
	const isInpostKeyValid = () => {
		const url = `${apiUrl}?${params}`;
		fetch(url, config)
			.then(response => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				if (appLocalizer?.inpostApiKey) {
					console.log("nie podano klucza API Inpost");
				}
				if (response.status === 200) {
					setLoading(false)
					setIsMapVisible(true)
					saveDataSessionStorage({ key: 'isInpostKeyValid', data: true })
				} else {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-ignore
					if (appLocalizer?.inpostApiKey) {
						console.log("Nieprawidłowy klucz API Inpost ");
					}
					setLoading(false)
					setIsMapVisible(false)
					saveDataSessionStorage({ key: 'isInpostKeyValid', data: false })
				}
			})
			.catch(error => {
				console.error(error);
			});



	}


	useEffect(() => {
		const isInpostKeyValidLocaStorage = loadDataFromSessionStorage({ key: 'isInpostKeyValid' })

		if (isInpostKeyValidLocaStorage === undefined) {
			isInpostKeyValid()
		} else if (isInpostKeyValidLocaStorage === false) {
			setLoading(false)
			setIsMapVisible(false)

			// setIsMapVisible(true)
		}
		else {
			setLoading(false)
			setIsMapVisible(true)
		}
	}, [])


	// const mapVisiblity = useMemo(() => isMapVisible ? "visible" : "hidden", [isMapVisible])
	const mapContainerVisibility = useMemo(() => isMapVisible ? "visible" : "hidden", [isMapVisible])
	const addressSearchVisibility = useMemo(() => isMapVisible ? "hidden" : "visible", [isMapVisible])
	const containerHeight = useMemo(() => isMapVisible ? "700px" : "0", [isMapVisible])
	const addressSearchVisiblity = useMemo(() => isMapVisible ? "none" : "block", [isMapVisible])


	return (

		<>

			{loading ?
				<div id="loader"
					style={{
						// visibility: loading ? "visible" : "hidden",
						inset: "100% auto auto 400px",
						width: "calc(100% + 16px)",
						display: 'flex',
						justifyContent: "center",
						alignItems: "flex-end",
						maxHeight: "65vh",
						height: loading ? "300px" : "0",
						marginTop: "8px",
						marginRight: "-17px",
						transition: "max-width 0.3s ease, max-height 0.3s ease, height 0.3s ease"
					}}>
					<CircularProgress style={{ height: "80px", width: "80px" }} />
				</div> : null}

			<div id="map-container"
				style={{
					visibility: loading ? "hidden" : mapContainerVisibility,
					inset: "100% auto auto 400px",
					width: "calc(100% + 16px)",
					maxHeight: "65vh",
					height: loading ? "" : containerHeight,
					marginTop: "8px",
					marginRight: "-17px",
					transition: "max-width 0.3s ease, max-height 0.3s ease, height 0.3s ease"
				}}>
				{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
				{/* @ts-ignore */}
				<inpost-geowidget id="3" onpoint="afterPointSelected"
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-ignore
					token={appLocalizer?.inpostApiKey || ""}
					language="en" config="parcelCollect">
					{/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
						//@ts-ignore */}
				</inpost-geowidget>
				<link rel="stylesheet" href="https://geowidget.inpost.pl/inpost-geowidget.css" />
			</div>

			<div id={"address-search"} style={{
				visibility: loading ? "hidden" : addressSearchVisibility,
				display: loading ? "none" : addressSearchVisiblity,
				inset: "100% auto auto 400px",
				width: "calc(100% + 16px)",
				marginTop: "8px",
				marginRight: "-17px",
				transition: "max-width 0.3s ease, max-height 0.3s ease, height 0.3s ease"
			}}>
				<AddressSearch
					addressNameRef={addressNameRef}
					setLockerIdValue={setLockerIdValue}
					setValue={setValue}
					setAdditionalInfo={setAdditionalInfo}

				/>
			</div>


			<Grid item xs={12}>
				<Controller
					name="addressName"
					control={control}
					render={({ field }) =>
						<StyledTextField  {...field} label={t('modal-form.pickupPointName')} fullWidth error={!!errors.addressName} helperText={errors?.addressName?.message} ref={addressNameRef} />
					}
				/>
			</Grid>
			<Grid item xs={12}>
				<FormLabel style={{ fontSize: '14px', fontFamily: "Inter, sans-serif", color: "#707070" }}>{t('modal-form.selectedPickUpPoint')}</FormLabel>
			</Grid>
			<Grid item xs={12}>
				<Typography variant="body1" align='left' style={{ fontSize: '14px', fontFamily: "Inter, sans-serif", color: "#707070" }}><>{t('modal-form.number')}: <span style={{ fontWeight: 'bold', color: 'black' }}>{getValues("lockerId") || ""}</span></></Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography variant="body1" align="left" style={{ fontSize: '14px', fontFamily: "Inter, sans-serif", color: "#707070" }}><>{t('modal-form.address')}: <span style={{ fontWeight: 'bold', color: 'black' }}>{getValues("address") || ""}</span></></Typography>
			</Grid>
			<Grid item xs={12} style={{ marginBottom: "16px" }}>
				<Typography variant="body1" align="left" style={{ fontSize: '14px', fontFamily: "Inter, sans-serif", color: "#707070" }}><>{t('modal-form.additionalInfo')}: <span style={{ fontWeight: 'bold', color: 'black' }}>{additionalInfo || ""}</span></></Typography>
			</Grid>

		</>
	)
}
