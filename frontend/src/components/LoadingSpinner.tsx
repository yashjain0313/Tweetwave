import React from "react";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
}
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md" }) => {
	const sizeClass = `loading-${size}`;

	return <span className={`loading loading-spinner ${sizeClass}`} />;
};
export default LoadingSpinner;