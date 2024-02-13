import styled from "styled-components";
import { useTranslation } from "react-i18next";

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





const SimplyBrandIcon = () => {
	const { t } = useTranslation();

	return (

		<div style={{ display: "flex", flexDirection: "column", fontSize: "14px", width: "100%", justifyContent: "center" }}>
			<div style={{ display: "flex", width: "auto", flexDirection: "column", alignItems: "center" }}>
				<svg height="30" width="164">
					<text x="50%" y="70%" fill="black" font-weight="600" font-size="14px" text-anchor="middle" alignment-baseline="middle">	{t('headerTitle')}</text>
				</svg>
				<svg width="164" height="39" viewBox="0 0 164 39" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M144.5 0H19.5C8.73045 0 0 8.73045 0 19.5C0 30.2696 8.73045 39 19.5 39H144.5C155.27 39 164 30.2696 164 19.5C164 8.73045 155.27 0 144.5 0Z" fill="url(#paint0_linear_1857_8431)" />
					<path d="M45.0095 14.4112C45.0095 15.2044 44.3469 15.839 43.5265 15.839C43.211 15.839 43.211 15.839 42.3591 15.5535C41.8858 15.3948 41.3179 15.2996 40.8761 15.2996C39.898 15.2996 39.1723 15.7756 39.1723 16.4101C39.1723 16.6957 39.3616 17.013 39.6456 17.1716C40.0558 17.4255 40.0558 17.4255 41.4441 17.7745C44.6939 18.5677 46.0507 19.8369 46.0507 21.9945C46.0507 23.1684 45.5774 24.279 44.7886 25.0722C43.8736 25.9923 42.3275 26.5 40.466 26.5C37.5316 26.5 35.4807 25.5481 35.4807 24.2472C35.4807 23.454 36.1433 22.7877 36.9321 22.7877C37.3423 22.7877 37.3423 22.7877 38.9515 23.3588C39.4563 23.5492 40.0873 23.6444 40.5922 23.6444C41.728 23.6444 42.4537 23.0733 42.4537 22.2483C42.4537 21.8358 42.2644 21.4868 41.8858 21.2964C41.4756 21.0426 41.1601 20.9474 39.551 20.5032C37.8471 20.0273 37.153 19.7417 36.522 19.1706C35.8909 18.6312 35.5754 17.7745 35.5754 16.7592C35.5754 14.2843 37.8471 12.5075 41.0024 12.5075C43.3372 12.4123 45.0095 13.2372 45.0095 14.4112Z" fill="white" />
					<path d="M47.6283 14.6015C47.6283 13.8717 47.6598 13.6813 47.8492 13.3323C48.1016 12.8881 48.7011 12.5708 49.3321 12.5708C49.9316 12.5708 50.5311 12.8881 50.7835 13.3323C50.9728 13.6813 51.0044 13.84 51.0044 14.6015V24.2788C51.0044 25.0086 50.9728 25.199 50.7835 25.548C50.5311 25.9922 49.9316 26.3095 49.3321 26.3095C48.7011 26.3095 48.1331 25.9922 47.8492 25.548C47.6598 25.199 47.6283 25.0403 47.6283 24.2788V14.6015Z" fill="white" />
					<path d="M55.7056 24.5327C55.5794 25.2624 55.5163 25.4528 55.2639 25.7701C55.0115 26.1191 54.4751 26.3412 53.9387 26.3412C52.9922 26.3412 52.298 25.6749 52.298 24.7865C52.298 24.5961 52.3296 24.374 52.3927 24.0567L54.128 14.3159C54.3173 13.2054 55.1061 12.5708 56.3998 12.5708C57.3779 12.5708 58.1983 13.0785 58.4822 13.8717L60.9433 20.7569L63.215 14.1573C63.5621 13.1419 64.414 12.5708 65.4237 12.5708C66.528 12.5708 67.4746 13.2371 67.6323 14.1573L69.4939 23.9933C69.5886 24.4692 69.5886 24.5644 69.5886 24.7865C69.5886 25.6749 68.8629 26.3412 67.9163 26.3412C67.3799 26.3412 66.8751 26.1191 66.5911 25.7701C66.3387 25.4528 66.2756 25.2942 66.1178 24.5327L64.982 18.2503L62.9942 24.5009C62.6787 25.4528 62.584 25.6749 62.3 25.897C61.9845 26.1826 61.5428 26.3095 61.0379 26.3095C60.0598 26.3095 59.5234 25.897 59.1764 24.85L56.81 18.2186L55.7056 24.5327Z" fill="white" />
					<path d="M74.416 24.2789C74.416 25.0087 74.3845 25.199 74.1952 25.5481C73.9427 25.9923 73.3433 26.3096 72.7438 26.3096C72.1127 26.3096 71.5448 25.9923 71.2608 25.5481C71.0715 25.199 71.04 25.0087 71.04 24.2789V14.9823C71.04 14.0304 71.1031 13.8083 71.387 13.4275C71.7972 12.9516 72.302 12.7612 73.0593 12.7612H73.4695H76.4985C78.1707 12.7612 79.3382 13.1103 80.253 13.8717C81.231 14.6967 81.799 15.9659 81.799 17.2668C81.799 18.3773 81.389 19.5195 80.663 20.3128C79.811 21.2646 78.5809 21.7406 76.9402 21.7406H74.3845V24.2789H74.416ZM76.0883 19.0753C77.445 19.0753 78.3285 18.3456 78.3285 17.2668C78.3285 16.1562 77.5081 15.4265 76.2461 15.4265H74.3845V19.0753H76.0883Z" fill="white" />
					<path d="M89.403 23.3904C90.129 23.3904 90.318 23.4222 90.665 23.5808C91.107 23.7712 91.423 24.2788 91.423 24.7548C91.423 25.2624 91.107 25.7701 90.665 25.9605C90.318 26.1191 90.161 26.1509 89.403 26.1509H85.428C83.598 26.2461 82.809 25.5163 82.904 23.8346V14.6332C82.904 13.9034 82.935 13.7131 83.124 13.364C83.377 12.9198 83.976 12.6025 84.607 12.6025C85.207 12.6025 85.806 12.9198 86.059 13.364C86.248 13.7131 86.28 13.8717 86.28 14.6332V23.3904H89.403Z" fill="white" />
					<path d="M97.165 24.2788C97.165 25.0086 97.134 25.199 96.944 25.548C96.692 25.9922 96.092 26.3095 95.493 26.3095C94.862 26.3095 94.294 25.9922 94.01 25.548C93.821 25.199 93.789 25.0403 93.789 24.2788V19.805L90.255 15.3947C89.782 14.7918 89.624 14.4428 89.624 14.0621C89.624 13.2371 90.381 12.5708 91.328 12.5708C92.022 12.5708 92.369 12.7929 93 13.6496L95.524 16.886L98.112 13.6179C98.774 12.7612 99.153 12.5708 99.815 12.5708C100.73 12.5708 101.519 13.2688 101.519 14.0621C101.519 14.5063 101.362 14.7918 100.825 15.4581L97.165 19.8368V24.2788Z" fill="white" />
					<path d="M123.327 8H110.683C107.808 8 105.519 10.3176 105.519 13.1633V25.8367C105.519 28.6824 107.837 31 110.683 31H123.356C126.202 31 128.519 28.6824 128.519 25.8367V13.1633C128.49 10.3176 126.172 8 123.327 8Z" fill="white" />
					<path d="M110.272 19.5004C110.272 18.679 110.536 18.0043 111.035 17.4469C111.181 17.2708 111.357 17.1535 111.563 17.0361C111.68 16.9775 111.768 16.8308 111.768 16.7134V15.0119C111.768 14.0731 111.093 13.2517 110.184 13.1344C109.04 12.9583 108.101 13.8384 108.101 14.8946V23.9596C108.101 24.8984 108.776 25.7198 109.685 25.8372C110.8 25.9838 111.768 25.1037 111.768 24.0183V22.2874C111.768 22.1407 111.68 22.0234 111.563 21.9647C111.387 21.8474 111.211 21.7007 111.035 21.554C110.506 20.9966 110.272 20.3219 110.272 19.5004Z" fill="#0000E9" />
					<path d="M123.855 13.1044C122.945 13.2218 122.271 14.0432 122.271 14.982V19.1771L117.665 13.7205C117.518 13.5445 117.342 13.3978 117.137 13.3098C117.107 13.2804 117.049 13.2804 117.019 13.2511C117.019 13.2511 116.99 13.2511 116.99 13.2218C116.961 13.2218 116.931 13.1924 116.873 13.1924C116.843 13.1924 116.814 13.1631 116.814 13.1631C116.785 13.1631 116.755 13.1338 116.726 13.1338C116.697 13.1338 116.667 13.1044 116.638 13.1044C116.609 13.1044 116.579 13.1044 116.55 13.1044C116.521 13.1044 116.491 13.1044 116.462 13.1044C116.433 13.1044 116.403 13.1044 116.374 13.1044C116.345 13.1044 116.315 13.1044 116.315 13.1044C116.257 13.1044 116.198 13.1044 116.139 13.1044C115.787 13.1338 115.435 13.2804 115.142 13.5151C114.878 13.7498 114.672 14.0432 114.584 14.3659C114.584 14.4246 114.555 14.4539 114.555 14.5126C114.555 14.5419 114.555 14.5419 114.555 14.5713C114.555 14.6006 114.555 14.6593 114.526 14.6886C114.526 14.7179 114.526 14.7179 114.526 14.7473C114.526 14.7766 114.526 14.8353 114.526 14.8646C114.526 14.894 114.526 14.894 114.526 14.9233V16.7128C114.526 16.8302 114.584 16.9769 114.702 17.0355C114.907 17.1529 115.083 17.2996 115.259 17.4756C115.758 18.033 116.022 18.7077 116.022 19.5292C116.022 20.3506 115.758 21.0253 115.259 21.5827C115.083 21.7588 114.907 21.9054 114.702 22.0228C114.584 22.0815 114.526 22.1988 114.526 22.3455V23.9883C114.526 24.9271 115.2 25.7486 116.11 25.8659C117.225 26.0126 118.193 25.1325 118.193 24.047V19.9105L122.711 25.2792C123.327 26.0126 124.441 26.1299 125.234 25.5432C125.703 25.2205 126.026 24.6631 126.026 24.047V14.894C125.908 13.8378 124.97 12.9577 123.855 13.1044Z" fill="#0000E9" />
					<path d="M113.117 21.1138C113 21.1138 112.883 21.1138 112.765 21.0845C112.443 21.0258 112.149 20.8791 111.944 20.6445C111.651 20.3217 111.504 19.9404 111.504 19.471C111.504 19.0016 111.651 18.6202 111.944 18.2975C112.237 17.9748 112.619 17.8281 113.117 17.8281C113.176 17.8281 113.235 17.8281 113.294 17.8575C113.704 17.8868 114.027 18.0335 114.291 18.2975C114.584 18.6202 114.731 19.0016 114.731 19.471C114.731 19.9404 114.584 20.3217 114.291 20.6445C114.144 20.7911 113.968 20.9085 113.763 20.9965C113.558 21.0845 113.352 21.1138 113.117 21.1138Z" fill="#FFC200" />
					<defs>
						<linearGradient id="paint0_linear_1857_8431" x1="228.288" y1="39.3885" x2="10.0512" y2="8.521" gradientUnits="userSpaceOnUse">
							<stop stop-color="#0000E9" />
							<stop offset="1" stop-color="#776AD1" />
						</linearGradient>
					</defs>
				</svg>
			</div>
		</div>


	)
}

export default SimplyBrandIcon