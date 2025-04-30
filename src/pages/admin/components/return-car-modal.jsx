"use client"

import { useState } from "react"
import { X, Check, AlertCircle } from "lucide-react"

export default function ReturnCarModal({ booking, onClose, onComplete }) {
    const [damageDetails, setDamageDetails] = useState({
        hasDamage: false,
        damageType: "none",
        description: "",
        additionalFee: 0,
        isPaid: false,
        paymentMethod: "Cash", // Default to Cash
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [showPayment, setShowPayment] = useState(false)

    const handleDamageChange = (e) => {
        const { name, value, type, checked } = e.target
        setDamageDetails((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
            // Reset additional fee when damage type changes
            ...(name === "damageType" && { additionalFee: getDamageBaseFee(value) }),
        }))
    }

    const getDamageBaseFee = (damageType) => {
        switch (damageType) {
            case "minor":
                return 1000
            case "moderate":
                return 5000
            case "major":
                return 10000
            default:
                return 0
        }
    }

    const handleAdditionalFeeChange = (e) => {
        const value = Number.parseFloat(e.target.value) || 0
        setDamageDetails((prev) => ({
            ...prev,
            additionalFee: value,
        }))
    }

    const handlePaymentToggle = () => {
        setShowPayment(!showPayment)
        if (!showPayment) {
            setDamageDetails((prev) => ({
                ...prev,
                isPaid: false,
            }))
        }
    }

    const handlePaymentSubmit = () => {
        setDamageDetails((prev) => ({
            ...prev,
            isPaid: true,
        }))
        setShowPayment(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            // Prepare the return data
            const returnData = {
                bookingId: booking.id,
                returnDate: new Date().toISOString(),
                damageAssessment: {
                    hasDamage: damageDetails.hasDamage,
                    damageType: damageDetails.damageType,
                    description: damageDetails.description,
                    additionalFee: damageDetails.additionalFee,
                    isPaid: damageDetails.isPaid,
                    paymentMethod: "Cash", // Always Cash
                    paymentDate: damageDetails.isPaid ? new Date().toISOString() : null,
                },
                status: "Completed",
            }

            // Call the parent handler
            if (onComplete) {
                await onComplete(returnData)
            }

            setSuccess("Car returned successfully!")

            // Close modal after a delay
            setTimeout(() => {
                onClose()
            }, 2000)
        } catch (error) {
            console.error("Error processing car return:", error)
            setError("Failed to process car return. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">Return Car</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center">
                            <Check className="h-5 w-5 mr-2" />
                            {success}
                        </div>
                    )}

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Car Details</h3>
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                            <div>
                                <p className="text-sm text-gray-500">Car</p>
                                <p className="font-medium">{booking.car || booking.carName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Chassis Number</p>
                                <p className="font-medium">{booking.carDetails?.chassisNumber || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Plate Number</p>
                                <p className="font-medium">{booking.carDetails?.plateNumber || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Return Date</p>
                                <p className="font-medium">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4">Damage Assessment</h3>

                            <div className="mb-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="hasDamage"
                                        checked={damageDetails.hasDamage}
                                        onChange={handleDamageChange}
                                        className="rounded border-gray-300 text-black focus:ring-black"
                                    />
                                    <span>Car has damage</span>
                                </label>
                            </div>

                            {damageDetails.hasDamage && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Damage Type</label>
                                        <select
                                            name="damageType"
                                            value={damageDetails.damageType}
                                            onChange={handleDamageChange}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                                        >
                                            <option value="none">None</option>
                                            <option value="minor">Minor (Scratches, small dents)</option>
                                            <option value="moderate">Moderate (Larger dents, broken lights)</option>
                                            <option value="major">Major (Significant body damage, mechanical issues)</option>
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            name="description"
                                            value={damageDetails.description}
                                            onChange={handleDamageChange}
                                            rows={3}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                                            placeholder="Describe the damage in detail..."
                                        ></textarea>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Fee (₱)</label>
                                        <input
                                            type="number"
                                            value={damageDetails.additionalFee}
                                            onChange={handleAdditionalFeeChange}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                                            min="0"
                                            step="100"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Base fee for {damageDetails.damageType} damage: ₱{getDamageBaseFee(damageDetails.damageType)}
                                        </p>
                                    </div>

                                    {damageDetails.additionalFee > 0 && (
                                        <div className="mb-4">
                                            {!damageDetails.isPaid ? (
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={handlePaymentToggle}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-md"
                                                    >
                                                        Collect Payment
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center">
                                                    <Check className="h-5 w-5 mr-2" />
                                                    Payment collected: ₱{damageDetails.additionalFee.toLocaleString()} (Cash)
                                                </div>
                                            )}

                                            {showPayment && (
                                                <div className="mt-4 p-4 border border-gray-200 rounded-md">
                                                    <h4 className="font-medium mb-2">Payment Details</h4>
                                                    <div className="mb-3">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                                        <input
                                                            type="text"
                                                            value="Cash"
                                                            disabled
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">Only cash payments are accepted</p>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                                        <div className="flex items-center">
                                                            <span className="mr-2">₱</span>
                                                            <input
                                                                type="text"
                                                                value={damageDetails.additionalFee}
                                                                disabled
                                                                className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={handlePaymentSubmit}
                                                            className="px-4 py-2 bg-black text-white rounded-md"
                                                        >
                                                            Confirm Payment
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="border-t pt-4 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-black text-white rounded-md flex items-center"
                                disabled={
                                    loading || (damageDetails.hasDamage && damageDetails.additionalFee > 0 && !damageDetails.isPaid)
                                }
                            >
                                {loading ? (
                                    <>
                                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                        Processing...
                                    </>
                                ) : (
                                    "Complete Return"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
