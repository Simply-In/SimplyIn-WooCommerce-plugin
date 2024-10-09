import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";

export const IconResponsiveContainer = styled.div`
	display: flex;
 	flex-direction: column;
	 @media (max-width: 768px) {
		flex-direction: column;

	  }
	  div:first-child {
		width: 100% !important
	  }
	`

const SimplyBrandIcon = ({ parentId }: { parentId: string }) => {
	const container = document.getElementById(parentId);
	if (container) {
		container.style.backgroundColor = "inherit"
	}


	const componentRef = useRef(null);
	const [parentWithBg, setParentWithBg] = useState(null);

	useEffect(() => {
		let element = componentRef.current

		setTimeout(() => {
			// Traverse up the DOM to find the first parent with a directly defined background-color
			while (element && (element as any).parentElement) {
				const parentStyle = window?.getComputedStyle((element as any).parentElement);
				const bgColor = parentStyle.backgroundColor


				// Check if the background-color is directly applied and not inherited (i.e., not 'rgba(0, 0, 0, 0)' which is usually the default transparent color)
				if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
					setParentWithBg((element as any)?.parentElement);
					break;
				}

				if ((element as any).parentElement) {
					element = (element as any).parentElement;
				} else {
					break;
				}
			}

		}, 100)
		setTimeout(() => {
			// Traverse up the DOM to find the first parent with a directly defined background-color
			while (element && (element as any).parentElement) {
				const parentStyle = window?.getComputedStyle((element as any).parentElement);
				const bgColor = parentStyle.backgroundColor

				// Check if the background-color is directly applied and not inherited (i.e., not 'rgba(0, 0, 0, 0)' which is usually the default transparent color)
				if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
					setParentWithBg((element as any)?.parentElement);
					break;
				}

				if ((element as any).parentElement) {
					element = (element as any).parentElement;
				} else {
					break;
				}
			}

		}, 500)
	}, []);


	console.log(parentWithBg);
	const { t } = useTranslation();

	let backgroundColor = ""
	if (parentWithBg) {
		const containerStyle = window?.getComputedStyle(parentWithBg as any);
		backgroundColor = containerStyle.backgroundColor;
		console.log('container background color', backgroundColor);
	}

	function getRGBComponents(color: any): any {
		if (color?.startsWith('rgb')) {
			const rgb = color.match(/\d+/g).map(Number);
			return { r: rgb[0], g: rgb[1], b: rgb[2] };
		}
		// Add support for hex colors if needed
		else if (color.startsWith('#')) {
			let hex = color.replace('#', '');
			if (hex.length === 3) {
				hex = hex.split('').map((char: any) => char + char).join('');
			}
			const bigint = parseInt(hex, 16);
			return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
		}
		return null;
	}

	function isLightColor(color: string) {
		if (!color) return true;
		const { r, g, b } = getRGBComponents(color);
		// Calculate the brightness of the color
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		// Consider a color light if the brightness is higher than 128
		return brightness > 128;
	}

	return (

		<div style={{ display: "flex", flexDirection: "column", fontSize: "14px", width: "100%", justifyContent: "center" }} ref={componentRef}> 
			<div style={{ display: "flex", width: "auto", flexDirection: "column", alignItems: "center" }}>
				<svg width="" height="32" viewBox="0 0 932 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%" }}>
					<path d="M264.253 16L1.99993 16" stroke="url(#paint0_linear_8948_22555)" strokeWidth="4" strokeLinecap="round" />
					<g transform="translate(50%, 50%)" >
						<g >
							<path d="M294.621 9.4703C294.621 10.4907 293.764 11.307 292.703 11.307C292.294 11.307 292.294 11.307 291.192 10.9397C290.58 10.7356 289.845 10.6132 289.274 10.6132C288.009 10.6132 287.07 11.2254 287.07 12.0417C287.07 12.4091 287.315 12.8172 287.682 13.0213C288.213 13.3479 288.213 13.3479 290.009 13.7968C294.213 14.8172 295.968 16.4499 295.968 19.2254C295.968 20.7356 295.356 22.1642 294.335 23.1846C293.152 24.3683 291.152 25.0213 288.743 25.0213C284.947 25.0213 282.294 23.7968 282.294 22.1234C282.294 21.103 283.151 20.2458 284.172 20.2458C284.702 20.2458 284.702 20.2458 286.784 20.9805C287.437 21.2254 288.254 21.3479 288.907 21.3479C290.376 21.3479 291.315 20.6132 291.315 19.5519C291.315 19.0213 291.07 18.5723 290.58 18.3274C290.049 18.0009 289.641 17.8785 287.56 17.307C285.355 16.6948 284.458 16.3274 283.641 15.5928C282.825 14.8989 282.417 13.7968 282.417 12.4907C282.417 9.30704 285.355 7.02132 289.437 7.02132C292.458 6.89887 294.621 7.9601 294.621 9.4703Z" fill={isLightColor(backgroundColor) ? "#303030" : "white"} />
							<path d="M298.009 9.71576C298.009 8.77698 298.05 8.53209 298.295 8.08311C298.621 7.51168 299.397 7.10352 300.213 7.10352C300.988 7.10352 301.764 7.51168 302.091 8.08311C302.335 8.53209 302.376 8.73617 302.376 9.71576V22.1647C302.376 23.1035 302.335 23.3484 302.091 23.7974C301.764 24.3688 300.988 24.777 300.213 24.777C299.397 24.777 298.662 24.3688 298.295 23.7974C298.05 23.3484 298.009 23.1443 298.009 22.1647V9.71576Z" fill={isLightColor(backgroundColor) ? "#303030" : "white"} />
							<path d="M308.458 22.4913C308.295 23.43 308.213 23.6749 307.887 24.0831C307.56 24.5321 306.866 24.8178 306.172 24.8178C304.948 24.8178 304.05 23.9607 304.05 22.8178C304.05 22.5729 304.091 22.2872 304.172 21.879L306.417 9.34841C306.662 7.91984 307.683 7.10352 309.356 7.10352C310.621 7.10352 311.683 7.75658 312.05 8.77698L315.234 17.6341L318.173 9.14433C318.622 7.83821 319.724 7.10352 321.03 7.10352C322.458 7.10352 323.683 7.96066 323.887 9.14433L326.295 21.7974C326.418 22.4096 326.418 22.5321 326.418 22.8178C326.418 23.9607 325.479 24.8178 324.254 24.8178C323.561 24.8178 322.907 24.5321 322.54 24.0831C322.214 23.6749 322.132 23.4709 321.928 22.4913L320.458 14.4096L317.887 22.4505C317.479 23.6749 317.356 23.9607 316.989 24.2464C316.581 24.6137 316.009 24.777 315.356 24.777C314.091 24.777 313.397 24.2464 312.948 22.8994L309.887 14.3688L308.458 22.4913Z" fill={isLightColor(backgroundColor) ? "#303030" : "white"} />
							<path d="M332.663 22.164C332.663 23.1028 332.622 23.3477 332.377 23.7966C332.051 24.3681 331.275 24.7762 330.5 24.7762C329.683 24.7762 328.948 24.3681 328.581 23.7966C328.336 23.3477 328.295 23.1028 328.295 22.164V10.2048C328.295 8.98031 328.377 8.6946 328.744 8.2048C329.275 7.59255 329.928 7.34766 330.908 7.34766H331.438H335.357C337.52 7.34766 339.03 7.79664 340.214 8.77623C341.479 9.83745 342.214 11.4701 342.214 13.1436C342.214 14.5721 341.684 16.0415 340.745 17.0619C339.643 18.2864 338.051 18.8987 335.928 18.8987H332.622V22.164H332.663ZM334.826 15.4701C336.581 15.4701 337.724 14.5313 337.724 13.1436C337.724 11.715 336.663 10.7762 335.03 10.7762H332.622V15.4701H334.826Z" fill={isLightColor(backgroundColor) ? "#303030" : "white"} />
							<path d="M352.051 21.0221C352.99 21.0221 353.235 21.0629 353.684 21.267C354.255 21.5119 354.663 22.1649 354.663 22.7772C354.663 23.4302 354.255 24.0833 353.684 24.3282C353.235 24.5323 353.031 24.5731 352.051 24.5731H346.908C344.541 24.6956 343.52 23.7568 343.643 21.5935V9.75678C343.643 8.818 343.683 8.5731 343.928 8.12412C344.255 7.55269 345.03 7.14453 345.847 7.14453C346.622 7.14453 347.398 7.55269 347.724 8.12412C347.969 8.5731 348.01 8.77718 348.01 9.75678V21.0221H352.051Z" fill={isLightColor(backgroundColor) ? "#303030" : "white"} />
							<path d="M362.092 22.1647C362.092 23.1035 362.051 23.3484 361.807 23.7974C361.48 24.3688 360.704 24.777 359.929 24.777C359.113 24.777 358.378 24.3688 358.011 23.7974C357.766 23.3484 357.725 23.1443 357.725 22.1647V16.4096L353.153 10.7362C352.541 9.96066 352.337 9.51168 352.337 9.02188C352.337 7.96066 353.317 7.10352 354.541 7.10352C355.439 7.10352 355.888 7.38923 356.704 8.49127L359.97 12.6545L363.317 8.45045C364.174 7.34841 364.664 7.10352 365.521 7.10352C366.705 7.10352 367.725 8.00148 367.725 9.02188C367.725 9.59331 367.521 9.96066 366.827 10.8178L362.092 16.4505V22.1647Z" fill={isLightColor(backgroundColor) ? "#303030" : "white"} />
							<path d="M397.563 0H379.929C375.97 0 372.746 3.22449 372.746 7.18367V24.8163C372.746 28.7755 375.97 32 379.929 32H397.563C401.522 32 404.746 28.7755 404.746 24.8163V7.18367C404.746 3.22449 401.522 0 397.563 0Z" fill="#0000E9" />
							<path d="M379.399 16.0005C379.399 14.8577 379.766 13.9189 380.46 13.1434C380.664 12.8985 380.909 12.7352 381.195 12.572C381.358 12.4903 381.481 12.2863 381.481 12.123V9.75564C381.481 8.44952 380.542 7.30666 379.276 7.1434C377.725 6.93931 376.378 8.1638 376.378 9.67401V22.2863C376.378 23.5924 377.317 24.7352 378.583 24.8985C380.134 25.1026 381.481 23.8781 381.481 22.3679V19.9597C381.481 19.7556 381.358 19.5924 381.195 19.5107C380.95 19.3475 380.705 19.1434 380.46 18.9393C379.725 18.0822 379.399 17.1434 379.399 16.0005Z" fill="white" />
							<path d="M398.297 7.1024C397.032 7.26566 396.093 8.40852 396.093 9.71464V15.5514L389.685 7.95954C389.481 7.71464 389.236 7.51056 388.95 7.38811C388.909 7.34729 388.828 7.34729 388.787 7.30648C388.787 7.30648 388.746 7.30648 388.746 7.26566C388.705 7.26566 388.664 7.22485 388.583 7.22485C388.542 7.22485 388.501 7.18403 388.501 7.18403C388.46 7.18403 388.42 7.14321 388.379 7.14321C388.338 7.14321 388.297 7.1024 388.256 7.1024C388.215 7.1024 388.175 7.1024 388.134 7.1024C388.093 7.1024 388.052 7.1024 388.011 7.1024C387.971 7.1024 387.93 7.1024 387.889 7.1024C387.848 7.1024 387.807 7.1024 387.807 7.1024C387.726 7.1024 387.644 7.1024 387.562 7.1024C387.073 7.14321 386.583 7.34729 386.175 7.67382C385.807 8.00035 385.521 8.40852 385.399 8.8575C385.399 8.93913 385.358 8.97995 385.358 9.06158C385.358 9.1024 385.358 9.1024 385.358 9.14321C385.358 9.18403 385.358 9.26566 385.317 9.30648C385.317 9.34729 385.317 9.34729 385.317 9.38811C385.317 9.42893 385.317 9.51056 385.317 9.55138C385.317 9.59219 385.317 9.59219 385.317 9.63301V12.1228C385.317 12.2861 385.399 12.4902 385.562 12.5718C385.848 12.735 386.093 12.9391 386.338 13.184C387.032 13.9595 387.399 14.8983 387.399 16.0412C387.399 17.184 387.032 18.1228 386.338 18.8983C386.093 19.1432 385.848 19.3473 385.562 19.5106C385.399 19.5922 385.317 19.7555 385.317 19.9595V22.2453C385.317 23.5514 386.256 24.6942 387.522 24.8575C389.073 25.0616 390.42 23.8371 390.42 22.3269V16.5718L396.705 24.0412C397.563 25.0616 399.114 25.2248 400.216 24.4085C400.869 23.9595 401.318 23.184 401.318 22.3269V9.59219C401.155 8.1228 399.848 6.89831 398.297 7.1024Z" fill="white" />
							<path d="M383.358 18.2453C383.195 18.2453 383.032 18.2453 382.868 18.2044C382.419 18.1228 382.011 17.9187 381.726 17.5922C381.317 17.1432 381.113 16.6126 381.113 15.9595C381.113 15.3065 381.317 14.7759 381.726 14.3269C382.134 13.8779 382.664 13.6738 383.358 13.6738C383.44 13.6738 383.522 13.6738 383.603 13.7146C384.175 13.7555 384.624 13.9595 384.991 14.3269C385.399 14.7759 385.603 15.3065 385.603 15.9595C385.603 16.6126 385.399 17.1432 384.991 17.5922C384.787 17.7963 384.542 17.9595 384.256 18.082C383.97 18.2044 383.685 18.2453 383.358 18.2453Z" fill="#FFC200" />
						</g>
						<g >
							<text x="57%" y="50%" fill={isLightColor(backgroundColor) ? "#707070" : "white"} fontWeight="600" fontSize="22px" textAnchor="middle" alignmentBaseline="middle">
								{t('headerTitle')}
							</text>
						</g>
					</g>
					<path d="M667.747 16L930 16" stroke="url(#paint1_linear_8948_22555)" strokeWidth="4" strokeLinecap="round" />
					<defs>
						<linearGradient id="paint0_linear_8948_22555" x1="264.253" y1="15.5" x2="1.99994" y2="15.5" gradientUnits="userSpaceOnUse">
							<stop stopColor="#F2F2FE" />
							<stop offset="1" stopColor="#4545EE" />
						</linearGradient>
						<linearGradient id="paint1_linear_8948_22555" x1="667.747" y1="16.5" x2="930" y2="16.5" gradientUnits="userSpaceOnUse">
							<stop stopColor="#F2F2FE" />
							<stop offset="1" stopColor="#4545EE" />
						</linearGradient>
						<clipPath id="clip0_8948_22555">
							<rect width="122.493" height="32" fill="white" transform="translate(282.253)" />
						</clipPath>
					</defs>
				</svg> 

			</div>
		</div>


	)
}

export default SimplyBrandIcon



