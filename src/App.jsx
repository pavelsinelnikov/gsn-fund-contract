import './css/normalize.css';
import './css/skeleton.css';
import './css/styles.css';

import React, { Component } from 'react';
import Portis from '@portis/web3';
import Web3 from 'web3';
import hubAbi from './hubAbi.json';
import defaultHubs from './defaultHubs.json';

const defaultNetwork = 'ropsten';
const portisDappId = '0b18bb5e-1019-4f19-bf23-fc995a38dcfb';

let portis = new Portis(portisDappId, defaultNetwork);
let web3 = new Web3(portis.provider);

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			network: defaultNetwork,
			hubAddress: defaultHubs[defaultNetwork],
			contractAddress: '',
			amountInEther: 0.01,
			balance: 0,
			loading: false,
			message: '',
		};
	}

	validAddresses = () => {
		let message = '';
		if (!web3.utils.isAddress(this.state.hubAddress)) {
			message = 'Error: Incorrect address for the Hub Contract Address';
		}

		if (!web3.utils.isAddress(this.state.contractAddress)) {
			if (message) {
				message += ' and for Your Contract';
			} else {
				message = 'Error: Incorrect address for Your Contract';
			}
		}

		this.setState({ message });

		if (message) {
			return false;
		}

		return true;
	};

	handleNetworkChange = (e) => {
		portis = new Portis(portisDappId, e.target.value);
		web3 = new Web3(portis.provider);

		this.setState({
			network: e.target.value,
			hubAddress: defaultHubs[e.target.value],
		});
	};

	getBalance = async () => {
		if (this.validAddresses()) {
			const hubContract = new web3.eth.Contract(hubAbi, this.state.hubAddress);
			const balance = web3.utils.fromWei(
				await hubContract.methods.balanceOf(this.state.contractAddress).call()
			);

			this.setState({ balance });
		}
	};

	handleSubmit = async () => {
		this.setState({ loading: true });
		try {
			if (this.validAddresses()) {
				const hubContract = new web3.eth.Contract(
					hubAbi,
					this.state.hubAddress
				);
				const accounts = await web3.currentProvider.enable();
				await hubContract.methods
					.depositFor(this.state.contractAddress)
					.send({
						from: accounts[0],
						value: web3.utils.toWei(
							this.state.amountInEther.toString(),
							'ether'
						),
					})
					.on('transactionHash', (hash) => {
						this.setState({
							message: 'Transaction Hash: ' + hash,
						});
					});
			}
		} catch (error) {
			this.setState({
				message:
					'Error: Something went wrong with submitting, check the console for more details',
			});
			console.log(error);
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
				<header className="row">
					<div className="six columns">
						<h1>Gas Station Funding</h1>
					</div>
					<div className="six columns smallTop">
						<p>
							<b>{this.state.message}</b>
						</p>
					</div>
				</header>
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
								<option selected value="ropsten">
									Ropsten
								</option>
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
						<div className="three columns">
							<label>Contract Balance</label>
							<p>{this.state.balance} ETH</p>
						</div>
					</div>

					<div className="row">
						<div className="six columns">
							<label htmlFor="amountInEtherInput">Amount in Ether</label>
							<input
								name="amountInEther"
								className="u-full-width"
								value={this.state.amountInEther}
								placeholder="Amount"
								type="text"
								onChange={this.handleChange}
								id="amountInEtherInput"
							/>
						</div>
						<div className="six columns smallTop">
							{!this.state.loading ? (
								<button
									type="button"
									className="u-full-width"
									onClick={this.handleSubmit}
								>
									Fund
								</button>
							) : (
								<p>
									<b>Processing Transaction...</b>
								</p>
							)}
						</div>
					</div>
				</form>
				<footer>
					<p>
						Credit to <a href="https://github.com/radotzki">Itay Radotzki</a>{' '}
						for creating the{' '}
						<a href="https://codesandbox.io/s/00jq8xn55v">
							Fund Contract in Relay Hub
						</a>{' '}
						template
					</p>
				</footer>
			</div>
		);
	}
}
