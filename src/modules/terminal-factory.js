/* globals StripePos */

/**
 * TerminalWrapper wraps the terminal and allows for users of this module to
 * log the output of requests to and from the Stripe SDK and output the github content
 */
class TerminalWrapper {
    constructor({
        onGetActivationToken,
        onReaderDisconnect,
        onConnectionStatusChange,
        onPaymentStatusChange,
        onUnexpectedReaderDisconnect
    }) {
        this._terminal = StripePos.createTerminal({
            onGetActivationToken: TerminalWrapper.OnGetActivationTokenWrapper(onGetActivationToken),
            onReaderDisconnect: TerminalWrapper.onReaderDisconnectWrapper(onReaderDisconnect),
            onConnectionStatusChange: TerminalWrapper.OnConnectionStatusChangeWrapper(onConnectionStatusChange),
            onPaymentStatusChange: TerminalWrapper.OnPaymentStatusChangeWrapper(onPaymentStatusChange),
            onUnexpectedReaderDisconnect: TerminalWrapper.OnUnexpectedReaderDisconnectWrapper(onUnexpectedReaderDisconnect)
        })
    }
    /**
     * The following static methods are wrappers for the the event handlers coming out of the
     * Stripe POS SDK. These wrappers allow for static points in code to log and demonstrate
     * the outputs expected from the terminal SDK. The declared function in each of these
     * handlers is explicitly named the ame exact name as the named parameter of the handler
     * expected by the `createTerminal` factory method
     */
    static OnGetActivationTokenWrapper (handler) {
        let onGetActivationToken = posDeviceId => handler(posDeviceId)
        return onGetActivationToken
    }
    static onReaderDisconnectWrapper (handler) {
        let onReaderDisconnect = event => handler(event)
        return onReaderDisconnect
    }
    static OnConnectionStatusChangeWrapper (handler) {
        let onConnectionStatusChange = (event) => handler(event)
        return onConnectionStatusChange
    }
    static OnPaymentStatusChangeWrapper (handler) {
        let onPaymentStatusChange = (event) => handler(event)
        return onPaymentStatusChange
    }
    static OnUnexpectedReaderDisconnectWrapper (handler) {
        let onUnexpectedReaderDisconnect = (event) => handler(event)
        return onUnexpectedReaderDisconnect
    }
    /* END HANDLER WRAPPERS */

    /**
     * The following methods wrap the normal calls to the StripePos SDK for tracing/logging.
     * We could collapse these into a general wrapper function, but making explicit static
     * functions helps with readability of the SDK usage
     */
    async disconnect() {
        const result = await this._terminal.disconnect()
        return result
    }

    async connect(reader) {
        const result = await this._terminal.connect(reader)
        return result
    }

    async discoverReaders() {
        const result = await this._terminal.discoverReaders()
        return result
    }

    async beginCheckout(options) {
        const result = await this._terminal.beginCheckout(options)
        return result
    }

    async endCheckout() {
        const result = await this._terminal.endCheckout()
        return result
    }

    async setBasket(options) {
        const result = await this._terminal.setBasket(options)
        return result
    }

    /** END POS SDK WRAPPERS */
}

/**
 * TerminalFactory is  factory class for TerminalWrapper to enforce
 * singleton creation of a wrapped Terminal object
 */
class TerminalFactory {
    static GetOrCreateTerminal({
        onGetActivationToken,
        onReaderDisconnect,
        onConnectionStatusChange,
        onPaymentStatusChange,
        onUnexpectedReaderDisconnect}) {
        if (this._terminal) {
            // there's only one terminal in any POS app
            return this._terminal
        }
        this._terminal = new TerminalWrapper({
            onGetActivationToken,
            onReaderDisconnect,
            onConnectionStatusChange,
            onPaymentStatusChange,
            onUnexpectedReaderDisconnect
        })
        return this._terminal
    }
}

export default TerminalFactory