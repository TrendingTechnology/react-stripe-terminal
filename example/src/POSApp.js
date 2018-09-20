import React, { Component } from 'react'
import Terminal from 'react-stripe-terminal';

class POSApp extends Component {

    renderConnectionDialog () {
        return (
            <div>
                <div className="row">
                    <h2>Connect to a Device</h2>
                    {this.props.stripePos.discoveredReaders.map(reader =>
                        <div className='row box' key={reader.id}>
                            <div className="col s8 reader-name">
                                <strong>{reader.label}</strong>
                                <p>{reader.ip_address}</p>
                                <p>Device: {reader.device_type} <i>({reader.status})</i></p>
                                <p>Device ID: {reader.id}</p>
                                <p>Serial#: {reader.serial_number}</p>
                            </div>
                            <div className="col s4">
                                <button className='btn right' onClick={() => this.props.stripePos.connectToReader(reader)}>Connect</button>
                            </div>
                        </div>)
                    }
                    <div className="row center">
                        <button className="btn green" onClick={() => this.props.stripePos.discoverReaders()}>Discover Readers</button>
                    </div>
                </div>
                <h3>Register a New Device</h3>
                <input type='text' onChange={event => this.setState({registrationToken: event.target.value})} />
                <button className='btn' onClick={() => this.props.stripePos.discoverReaders(this.state.registrationToken)}>Register</button>
                {this.renderError()}
            </div>
        )
    }

    renderBasketItems () {
        return <div className='row item-list'>
            {this.props.stripePos.lineItems.length ? this.props.stripePos.lineItems.map((item, index) =>
                <div className='list-item' key={`stripe-pos-item-${index}`}>
                    <div className='row'>
                        <div className='col s8'>
                            <strong>Description: {item.description} x{item.quantity}</strong>
                            <p>Price: ${(item.amount / 100).toFixed(2)} each</p>
                            <p>Amount: ${((item.amount * item.quantity) / 100).toFixed(2)}</p>
                        </div>
                        <div className='col s4'>
                            <button disabled={this.props.stripePos.connectionStatus !== 'connected'} className='btn red right' onClick={() => this.props.stripePos.removeLineItem(index)}>Remove</button>
                        </div>
                    </div>
                </div>)
            : <h3 className='empty-basket-placeholder'>Basket Empty</h3>}
        </div>
    }

    renderError () {
        if (!this.props.stripePos.error) {
            return;
        }
        return  <div className="error-box">
                    <p>{this.props.stripePos.error.message}</p>
                </div>
    }

    render () {
        let component
        if (this.props.stripePos.connection) {
            component = <div>
                <h1>Checkout Basket</h1>
                {this.renderBasketItems()}
                <div className='row'>
                    <div className='col s6 right'>
                        <p>Sub Total: ${(this.props.stripePos.total / 100).toFixed(2)}</p>
                        <p>Tax: ${(this.props.stripePos.tax / 100).toFixed(2)}</p>
                        <p>Total: ${(this.props.stripePos.balanceDue / 100).toFixed(2)}</p>
                    </div>
                    <div className='col s6'>
                        <div className="row">
                            <button disabled={this.props.stripePos.connectionStatus !== 'connected'} className='btn green' onClick={() => this.props.stripePos.addLineItem({
                                description: 'Silver Hat',
                                amount: 2000,
                                quantity: 2
                            })}>Add Item</button>
                        </div>
                        <div className="row">
                            <button disabled={this.props.stripePos.connectionStatus !== 'connected'} onClick={() => this.props.stripePos.createPayment({
                                amount: this.props.stripePos.balanceDue,
                                description: 'Purchase'
                            })} className='btn'>Create ${(this.props.stripePos.balanceDue / 100).toFixed(2)} Charge</button>
                        </div>
                    </div>
                </div>
                {this.renderError()}
                <div className='row'>
                    <div className='col s8'>
                        <h3>Device Status: {this.props.stripePos.connectionStatus}</h3>
                        {this.props.stripePos.connectionStatus === 'connected' && this.props.stripePos.paymentStatus ? <h3>Payment Status: {this.props.stripePos.paymentStatus}</h3> : null}
                    </div>
                    <div className='col s4'>
                        <button disabled={!this.props.stripePos.connection} className='btn red right' onClick={() => this.props.stripePos.disconnectReader()}>Disconnect</button>
                    </div>
                </div>
            </div>
        } else if (this.props.stripePos.connecting) {
            // TODO show a (real) pre-loader
            component = <div>
                <div className='preloader'>
                    Connecting...
                </div>
            </div>
        } else {
            component = this.renderConnectionDialog()
        }
        return component
    }
}

export default Terminal(POSApp)
