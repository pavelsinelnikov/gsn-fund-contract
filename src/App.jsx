import './css/normalize.css';
import './css/skeleton.css';
import './css/styles.css';

import React, { Component } from 'react';
import Portis from '@portis/web3';
import Web3 from 'web3';
import hubAbi from './hubAbi.json';
import defaultHubs from './defaultHubs.json';

const defaultNetwork = 'mainnet';
const portisDappId = '211b48db-e8cc-4b68-82ad-bf781727ea9e';

let portis = new Portis(portisDappId, defaultNetwork);
let web3 = new Web3(portis.provider);
let hubContract = new web3.eth.Contract(hubAbi, defaultHubs[defaultNetwork]);

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			network: defaultNetwork,
			hubAddress: defaultHubs[defaultNetwork],
			contractAddress: '',
			amountInEther: 1,
			balance: 0,
			loading: false,
		};
	}

	handleNetworkChange = (e) => {
		portis = new Portis(portisDappId, e.target.value);
		web3 = new Web3(portis.provider);
		hubContract = new web3.eth.Contract(hubAbi, defaultHubs[e.target.value]);

		this.setState({
			network: e.target.value,
			hubAddress: defaultHubs[e.target.value],
		});
	};

	getBalance = async () => {
		const balance = await hubContract.methods
			.balanceOf(this.state.contractAddress)
			.call();
		this.setState({ balance });

		console.log(balance);
	};

	handleSubmit = async () => {
		this.setState({ loading: true });
		try {
			const accounts = await web3.currentProvider.enable();
			await hubContract.methods.depositFor(this.state.contractAddress).send({
				from: accounts[0],
				value: this.state.amountInEther * 10 ** 18,
			});

			console.log(`🚀 Your balance in the Hub is: ${balance / 10 ** 18} ETH`);
		} catch (error) {
			console.error(error);
		} finally {
			this.setState({ loading: false });
		}
	};

	handleChange = (e) => {
		this.setState({ [e.target.name]: e.target.value });
	};

	render() {
		return (
			<div className="App container">
				<form>
					<div className="row">
						<div className="six columns">
							<label htmlFor="hubAddressInput">Hub Contract Address</label>
							<input
								name="hubAddress"
								value={this.state.hubAddress}
								className="u-full-width"
								placeholder="0x.."
								type="text"
								onChange={this.handleChange}
								id="hubAddressInput"
							/>
						</div>

						<div className="six columns">
							<label htmlFor="networkDropdown">Network</label>
							<select
								name="network"
								defaultValue={defaultNetwork}
								className="u-full-width"
								onChange={this.handleNetworkChange}
								id="networkDropdown"
							>
								<option value="mainnet">Mainnet</option>
								<option value="rinkeby">Rinkeby</option>
								<option value="ropsten">Ropsten</option>
								<option value="kovan">Kovan</option>
								<option value="goerli">Goerli</option>
								<option value="xdai">xDai</option>
							</select>
						</div>
					</div>

					<div className="row">
						<div className="six columns">
							<label htmlFor="contractAddressInput">
								Your Contract Address
							</label>
							<input
								name="contractAddress"
								className="u-full-width"
								value={this.state.contractAddress}
								placeholder="0x.."
								type="text"
								onChange={this.handleChange}
								id="contractAddressInput"
							/>
						</div>
						<div className="three columns smallTop">
							<button
								className="u-full-width"
								type="button"
								onClick={this.getBalance}
							>
								Get Balance
							</button>
						</div>
						<div className="three columns smallTop">
							{this.state.balance} ETH
						</div>
					</div>

					<div className="row">
						<div className="six columns">
							<label htmlFor="amountInEtherInput">Amount in Ether</label>
							<input
								name="amountInEther"
								className="u-full-width"
								value={this.state.amountInEther}
								placeholder="1"
								type="text"
								onChange={this.handleChange}
								id="amountInEtherInput"
							/>
						</div>
						<div className="six columns smallTop">
							{!this.state.loading && (
								<button
									type="button"
									className="u-full-width"
									onClick={this.handleSubmit}
								>
									Fund
								</button>
							)}
							{this.state.loading}
						</div>
					</div>
				</form>
			</div>
		);
	}
}
