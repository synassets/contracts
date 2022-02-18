// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;
//pragma experimental ABIEncoderV2;

/**
 * @title Initializable
 *
 * @dev Helper contract to support initializer functions. To use it, replace
 * the constructor with a function that has the `initializer` modifier.
 * WARNING: Unlike constructors, initializer functions must be manually
 * invoked. This applies both to deploying an Initializable contract, as well
 * as extending an Initializable contract via inheritance.
 * WARNING: When used with inheritance, manual care must be taken to not invoke
 * a parent initializer twice, or ensure that all initializers are idempotent,
 * because this is not dealt with automatically as with constructors.
 */
contract Initializable {

    /**
     * @dev Indicates that the contract has been initialized.
     */
    bool private initialized;

    /**
     * @dev Indicates that the contract is in the process of being initialized.
     */
    bool private initializing;

    /**
     * @dev Modifier to use in the initializer function of a contract.
     */
    modifier initializer() {
        require(initializing || isConstructor() || !initialized, "Contract instance has already been initialized");

        bool isTopLevelCall = !initializing;
        if (isTopLevelCall) {
            initializing = true;
            initialized = true;
        }

        _;

        if (isTopLevelCall) {
            initializing = false;
        }
    }

    /// @dev Returns true if and only if the function is running in the constructor
    function isConstructor() private view returns (bool) {
        // extcodesize checks the size of the code stored in an address, and
        // address returns the current address. Since the code is still not
        // deployed when running a constructor, any checks on its code size will
        // yield zero, making it an effective way to detect if a contract is
        // under construction or not.
        address self = address(this);
        uint256 cs;
        assembly { cs := extcodesize(self) }
        return cs == 0;
    }

    // Reserved storage space to allow for layout changes in the future.
    uint256[50] private ______gap;
}

/**
 * @dev Wrappers over Solidity's arithmetic operations with added overflow
 * checks.
 *
 * Arithmetic operations in Solidity wrap on overflow. This can easily result
 * in bugs, because programmers usually assume that an overflow raises an
 * error, which is the standard behavior in high level programming languages.
 * `SafeMath` restores this intuition by reverting the transaction when an
 * operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs, so it's recommended to use it always.
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    function sub0(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a - b : 0;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts with custom message when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // According to EIP-1052, 0x0 is the value returned for not-yet created accounts
        // and 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470 is returned
        // for accounts without code, i.e. `keccak256('')`
        bytes32 codehash;
        bytes32 accountHash = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
        // solhint-disable-next-line no-inline-assembly
        assembly { codehash := extcodehash(account) }
        return (codehash != accountHash && codehash != 0x0);
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
        (bool success, ) = recipient.call{ value: amount }("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }
}

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for ERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    using SafeMath for uint256;
    using Address for address;

    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    function safeApprove(IERC20 token, address spender, uint256 value) internal {
        // safeApprove should only be called when setting an initial allowance,
        // or when resetting it to zero. To increase and decrease it, use
        // 'safeIncreaseAllowance' and 'safeDecreaseAllowance'
        // solhint-disable-next-line max-line-length
        require((value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: approve from non-zero to non-zero allowance"
        );
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
    }

    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 newAllowance = token.allowance(address(this), spender).add(value);
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    function safeDecreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 newAllowance = token.allowance(address(this), spender).sub(value, "SafeERC20: decreased allowance below zero");
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves.

        // A Solidity high level call has three parts:
        //  1. The target address is checked to verify it contains contract code
        //  2. The call itself is made, and success asserted
        //  3. The return value is decoded, which in turn checks the size of the returned data.
        // solhint-disable-next-line max-line-length
        require(address(token).isContract(), "SafeERC20: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = address(token).call(data);
        require(success, "SafeERC20: low-level call failed");

        if (returndata.length > 0) { // Return data is optional
            // solhint-disable-next-line max-line-length
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}


contract Governable is Initializable {
    address public governor;

    event GovernorshipTransferred(address indexed previousGovernor, address indexed newGovernor);

    /**
     * @dev Contract initializer.
     * called once by the factory at time of deployment
     */
    function __Governable_init_unchained(address governor_) virtual public initializer {
        governor = governor_;
        emit GovernorshipTransferred(address(0), governor);
    }

    modifier governance() {
        require(msg.sender == governor);
        _;
    }

    /**
     * @dev Allows the current governor to relinquish control of the contract.
     * @notice Renouncing to governorship will leave the contract without an governor.
     * It will not be possible to call the functions with the `governance`
     * modifier anymore.
     */
    function renounceGovernorship() public governance {
        emit GovernorshipTransferred(governor, address(0));
        governor = address(0);
    }

    /**
     * @dev Allows the current governor to transfer control of the contract to a newGovernor.
     * @param newGovernor The address to transfer governorship to.
     */
    function transferGovernorship(address newGovernor) public governance {
        _transferGovernorship(newGovernor);
    }

    /**
     * @dev Transfers control of the contract to a newGovernor.
     * @param newGovernor The address to transfer governorship to.
     */
    function _transferGovernorship(address newGovernor) internal {
        require(newGovernor != address(0));
        emit GovernorshipTransferred(governor, newGovernor);
        governor = newGovernor;
    }
}

contract PreSale is Governable {
	using SafeMath for uint;
	using SafeERC20 for IERC20;

	IERC20 public currency;
	IERC20 public token;
	uint public ratio;
	address payable public recipient;
	uint public timeOfferBegin;
    uint public timeOfferEnd;

    uint public ratioUnlockFirst;
    uint public timeClaimFirst;
    uint public timeUnlockBegin;
    uint public timeUnlockEnd;

	uint public totalQuota;
	uint public totalOffered;
	uint public totalClaimed;

    mapping (address => SaleInfo) public saleInfos;

    bool public enableWhiteList;

    struct SaleInfo {
        uint quota;
        uint offered;
        uint claimed;
    }

    // view function
    function quotaOf(address account) external view returns (uint) {
        return saleInfos[account].quota;
    }

    function offeredOf(address account) external view returns (uint) {
        return saleInfos[account].offered;
    }

    function claimedOf(address account) external view returns (uint) {
        return saleInfos[account].claimed;
    }

	function __PreSale_init(
        address governor_,
        address currency_,
        address token_,
        uint ratio_,
        address payable recipient_,
        uint timeOfferBegin_,
        uint timeOfferEnd_,
        uint ratioUnlockFirst_,
        uint timeClaimFirst_,
        uint timeUnlockBegin_,
        uint timeUnlockEnd_,
        bool enableWhiteList_
    ) external initializer {
		__Governable_init_unchained(governor_);
        __PreSale_init_unchained(currency_, token_, ratio_, recipient_, timeOfferBegin_, timeOfferEnd_, ratioUnlockFirst_, timeClaimFirst_, timeUnlockBegin_, timeUnlockEnd_, enableWhiteList_);
	}

	function __PreSale_init_unchained(
        address currency_,
        address token_,
        uint ratio_,
        address payable recipient_,
        uint timeOfferBegin_,
        uint timeOfferEnd_,
        uint ratioUnlockFirst_,
        uint timeClaimFirst_,
        uint timeUnlockBegin_,
        uint timeUnlockEnd_,
        bool enableWhiteList_
    ) public governance {
		currency = IERC20(currency_);
		token = IERC20(token_);
		ratio = ratio_;
		recipient = recipient_;

        require(timeOfferBegin_ > block.timestamp, 'IT');
        require(timeOfferEnd_ > timeOfferBegin_, 'IOT');
	    timeOfferBegin = timeOfferBegin_;
        timeOfferEnd = timeOfferEnd_;

        require(ratioUnlockFirst_ <= 1 ether, 'IR');
        ratioUnlockFirst = ratioUnlockFirst_;

        require(timeUnlockBegin_ >= timeClaimFirst_, 'IUT');
        timeClaimFirst = timeClaimFirst_;

        require(timeUnlockEnd_ >= timeUnlockBegin_, 'IUT');
        timeUnlockBegin = timeUnlockBegin_;
        timeUnlockEnd = timeUnlockEnd_;

        enableWhiteList = enableWhiteList_;
	}

    function setQuota(address addr, uint amount) public governance {
        totalQuota = totalQuota.add(amount).sub(saleInfos[addr].quota);
        saleInfos[addr].quota = amount;
        emit Quota(addr, amount, totalQuota);
    }
    event Quota(address indexed addr, uint amount, uint total);

    function setQuotasWithSameAmount(address[] memory addrs, uint amount) external {
        for(uint i=0; i<addrs.length; i++)
            setQuota(addrs[i], amount);
    }

    function setQuotas(address[] memory addrs, uint[] memory amounts) external {
        for(uint i=0; i<addrs.length; i++)
            setQuota(addrs[i], amounts[i]);
    }

	function offer(uint amount) external {
		require(address(currency) != address(0), 'should call offerETH() instead');
        require(tx.origin == msg.sender, 'disallow contract caller');

		require(block.timestamp >= timeOfferBegin, "it's not time yet");
		require(block.timestamp < timeOfferEnd, "expired");

		amount = enableWhiteList ? saleInfos[msg.sender].quota : saleInfos[address(this)].quota;
		require(amount > 0, 'no quota');
		require(currency.allowance(msg.sender, address(this)) >= amount, 'allowance not enough');
		require(currency.balanceOf(msg.sender) >= amount, 'balance not enough');
		require(saleInfos[msg.sender].offered == 0, 'offered already');

		currency.safeTransferFrom(msg.sender, recipient, amount);
		uint volume = amount.mul(ratio).div(1e18);
        saleInfos[msg.sender].offered = volume;
		totalOffered = totalOffered.add(volume);
		require(totalOffered <= token.balanceOf(address(this)), 'Quota is full');
		emit Offer(msg.sender, amount, volume, totalOffered);
	}
	event Offer(address indexed addr, uint amount, uint volume, uint total);

	function offerETH() public payable {
		require(address(currency) == address(0), 'should call offer(uint amount) instead');
        require(tx.origin == msg.sender, 'disallow contract caller');

		require(block.timestamp >= timeOfferBegin, "it's not time yet");
        require(block.timestamp < timeOfferEnd, "expired");

        uint amount = enableWhiteList ? saleInfos[msg.sender].quota : saleInfos[address(this)].quota;
		require(amount > 0, 'no quota');
        require(msg.value >= amount, 'transfer amount not enough');
		require(saleInfos[msg.sender].offered == 0, 'offered already');

		recipient.transfer(amount);
		uint volume = amount.mul(ratio).div(1e18);
		saleInfos[msg.sender].offered = volume;
		totalOffered = totalOffered.add(volume);
		require(totalOffered <= token.balanceOf(address(this)), 'Quota is full');
		if(msg.value > amount)
		    msg.sender.transfer(msg.value.sub(amount));
		emit Offer(msg.sender, amount, volume, totalOffered);
	}

    function claimable(address _account) public view returns (uint amount_) {
        amount_ = 0;
        if (block.timestamp > timeClaimFirst) {
            uint _volume = saleInfos[_account].offered;
            amount_ = _volume.mul(ratioUnlockFirst).div(1 ether);
            if (block.timestamp >= timeUnlockEnd) amount_ = _volume;
            else if (block.timestamp > timeUnlockBegin) amount_ = _volume.sub(amount_).mul(block.timestamp.sub(timeUnlockBegin)).div(timeUnlockEnd.sub(timeUnlockBegin)).add(amount_);

            amount_ = amount_.sub(saleInfos[_account].claimed);
        }
    }

    function claim() public {
        require(block.timestamp >= timeClaimFirst, "it's not time yet");

        uint _volume = claimable(msg.sender);
        require(_volume > 0, 'claimed already');

        uint _claimed = _volume.add(saleInfos[msg.sender].claimed);
        require(_claimed <= saleInfos[msg.sender].offered, 'exceeded offered');

        saleInfos[msg.sender].claimed = _claimed;
        totalClaimed = _volume.add(totalClaimed);

        token.safeTransfer(msg.sender, _volume);
        emit Claim(msg.sender, _volume, totalClaimed);
    }
    event Claim(address indexed addr, uint volume, uint total);

    /// @notice This method can be used by the owner to extract mistakenly
    ///  sent tokens to this contract.
    /// @param _token The address of the token contract that you want to recover
    function rescueTokens(address _token, address _dst) public governance {
        require(block.timestamp > timeOfferEnd);
        uint balance = IERC20(_token).balanceOf(address(this));
        if (_token == address(token))
            balance = balance.add(totalClaimed).sub(totalOffered);

        IERC20(_token).safeTransfer(_dst, balance);
    }

    function withdrawToken(address _dst) external governance {
        rescueTokens(address(token), _dst);
    }

    function withdrawToken() external governance {
        rescueTokens(address(token), msg.sender);
    }

    function withdrawETH(address payable _dst) external governance {
        require(address(currency) != address(0));
        _dst.transfer(address(this).balance);
    }

    function withdrawETH() external governance {
        require(address(currency) != address(0));
        msg.sender.transfer(address(this).balance);
    }

    receive() external payable{
        if(msg.value > 0)
            offerETH();
        else
            claim();
    }

    fallback() external {
        claim();
    }
}
