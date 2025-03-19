const Booking = require('../models/booking.model')

const findBookingByBookingId = async (bookingId) => {
    console.log("Finding booking by booking id", bookingId)
    try {
        const booking = await Booking.findOne({ bookingId: bookingId })
            return {status: true, message: "Booking found", data: booking}
    } catch (error) {
        console.log(error)
        return {status: false, message: "Error finding booking", error: error}
    }
}

const updateBookingStatus = async (bookingId, status) => {
    console.log("Updating booking status", bookingId, status)
    try {
        const booking = await Booking.findOneAndUpdate({ bookingId: bookingId }, { status: status }, { new: true })
        if (!booking) {
            return {status: false, message: "Booking not found"}
        }
        return {status: true, message: "Booking status updated successfully", data: booking}
    } catch (error) {
        console.log(error)
        return {status: false, message: "Error updating booking status", error: error}
    }
}

const declineBooking = async (bookingId) => {
    try {
        const booking = await Booking.findOneAndUpdate({ bookingId: bookingId }, { status: "declined" }, { new: true })
        if (!booking) {
            return {status: false, message: "Booking not found"}
        }
        return {status: true, message: "Booking declined successfully", data: booking}
    } catch (error) {
        return {status: false, message: "Error declining booking", error: error}
    }
}

const deleteBooking = async (bookingId) => {
    console.log("Deleting booking", bookingId)
    try {
        const booking = await Booking.findOneAndDelete({ bookingId: bookingId })
        if (!booking) {
            return {status: false, message: "Booking not found"}
        }
            return {status: true, message: "Booking deleted successfully", data: booking}
    } catch (error) {
        console.log(error)
        return {status: false, message: "Error deleting booking", error: error}
    }
}

module.exports = { findBookingByBookingId, updateBookingStatus, declineBooking, deleteBooking }
