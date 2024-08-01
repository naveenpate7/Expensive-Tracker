import React, { useEffect, useState } from 'react';

const Nav = () => {
    const [addDisplay, setAddDisplay] = useState(false);
    const [reason, setReason] = useState("");
    const [amount, setAmount] = useState("");
    const [radioOption, setRadioOption] = useState("");
    const [displayIncome, setDisplayIncome] = useState(0);
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response = await fetch('https://expensives-project-default-rtdb.firebaseio.com/yourEndpoint.json');
                let result = await response.json();
                let formattedData = Object.keys(result).map(key => ({ id: key, ...result[key] }));
                setData(formattedData);

                // Calculate initial balance
                const initialBalance = formattedData.reduce((acc, item) => {
                    return acc + (item.type === "Income" ? (parseFloat(item.amount) || 0) : -(parseFloat(item.amount) || 0));
                }, 0);
                setDisplayIncome(initialBalance);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const showAdd = () => {
        setAddDisplay(!addDisplay);
    };

    const changeHandlerReason = (e) => {
        setReason(e.target.value);
    };

    const changeHandlerAmount = (e) => {
        setAmount(e.target.value);
    };

    const handleRadioChange = (e) => {
        setRadioOption(e.target.value);
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        // Validate input
        if (!reason || isNaN(amount) || amount <= 0 || !radioOption) {
            alert("Please fill out all fields correctly.");
            return;
        }

        let dataToSend = {
            reason: reason,
            amount: parseFloat(amount),
            type: radioOption
        };

        try {
            let response = await fetch('https://expensives-project-default-rtdb.firebaseio.com/yourEndpoint.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            const result = await response.json();
            console.log('Data added successfully:', result);

            // Update displayIncome based on the type of transaction
            setDisplayIncome((prevIncome) => prevIncome + (radioOption === "Income" ? parseFloat(amount) : -parseFloat(amount)));
            setAddDisplay(false);
            setAmount("");
            setReason("");
            setRadioOption("");

            // Fetch updated data
            const updatedResponse = await fetch('https://expensives-project-default-rtdb.firebaseio.com/yourEndpoint.json');
            const updatedResult = await updatedResponse.json();
            let updatedData = Object.keys(updatedResult).map(key => ({ id: key, ...updatedResult[key] }));
            setData(updatedData);

            // Recalculate displayIncome based on updated data
            const updatedBalance = updatedData.reduce((acc, item) => {
                return acc + (item.type === "Income" ? (parseFloat(item.amount) || 0) : -(parseFloat(item.amount) || 0));
            }, 0);
            setDisplayIncome(updatedBalance);

        } catch (error) {
            console.error('Error adding data:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    // Filter data based on search query
    const filteredData = data.filter(item =>
        item.reason.toLowerCase().includes(searchQuery)
    );

    // Ensure displayIncome is always a number
    const formattedIncome = Number(displayIncome).toFixed(2);

    return (
        <div className='d-flex flex-column justify-content-center align-items-center vh-100 bg-light'>
            {/* Balance and Add Section */}
            <div className='d-flex flex-row align-items-center justify-content-between w-75 p-3 bg-white rounded shadow'>
                <div className='d-flex flex-row align-items-center'>
                    <h4 className='mb-0 me-2'>Balance:</h4>
                    <p id='amount' className='m-3'>Rs {formattedIncome}</p>
                </div>
                <button className='btn btn-dark' onClick={showAdd}>{addDisplay ? "Cancel" : "ADD"}</button>
            </div>

            {/* Search Bar */}
            <div className='d-flex flex-row w-75 p-3 bg-white rounded shadow mt-3'>
                <input
                    type="text"
                    placeholder='Search transactions...'
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className='form-control'
                />
            </div>

            {/* Add components */}
            {addDisplay && (
                <div className='d-flex flex-column w-75 p-3 bg-dark rounded shadow mt-3'>
                    <form className='d-flex flex-column bg-dark rounded shadow' onSubmit={submitHandler}>
                        <input
                            type="text"
                            placeholder='Enter the Reason'
                            value={reason}
                            onChange={changeHandlerReason}
                            className='m-2 br-2 w-45'
                        />
                        <input
                            type="number"
                            value={amount}
                            placeholder='Enter the Amount'
                            onChange={changeHandlerAmount}
                            className='m-2 br-2'
                        />
                        <div className='d-flex flex-row radioButtons'>
                            <input
                                type="radio"
                                className='m-2'
                                value="Income"
                                checked={radioOption === "Income"}
                                onChange={handleRadioChange}
                            />
                            <label>Income</label>
                            <input
                                type="radio"
                                className='m-2'
                                value="Spend"
                                checked={radioOption === "Spend"}
                                onChange={handleRadioChange}
                            />
                            <label>Spend</label>
                        </div>
                        <button className='btn btn-primary d-inline mt-2' type='submit'>ADD</button>
                    </form>
                </div>
            )}

            {/* Display data */}
            {filteredData.length > 0 ? (
                filteredData.map((item) => (
                    <div key={item.id} className='d-flex flex-row align-items-center justify-content-between w-75 p-3 bg-white rounded shadow m-2'>
                        <h4 className='mb-0'>{item.reason}</h4>
                        <div className='d-flex flex-row align-items-center'>
                            <h4 className='mb-0'>Rs {Number(item.amount).toFixed(2)}</h4>
                            <div
                                className={`w-25 h-3 rounded ms-2 ${item.type === "Income" ? "bg-success" : "bg-danger"}`}
                            ></div>
                        </div>
                    </div>
                ))
            ) : (
                <p>No transactions available</p>
            )}
        </div>
    );
}

export default Nav;
