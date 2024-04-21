import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Collapse, Box } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import './styles.css'; 
const HoldingsTable = () => {
    const [groupedHoldings, setGroupedHoldings] = useState({});
    const [expandedGroups, setExpandedGroups] = useState({});

    useEffect(() => {
        axios.get('https://canopy-frontend-task.now.sh/api/holdings')
            .then(response => {
                const holdings = response.data.payload;
                const grouped = groupHoldingsByAssetClass(holdings);
                setGroupedHoldings(grouped);
                
                const initialExpandedState = Object.keys(grouped).reduce((acc, curr) => {
                    acc[curr] = false;
                    return acc;
                }, {});
                setExpandedGroups(initialExpandedState);
            })
            .catch(error => {
                console.error('Error fetching holdings:', error);
            });
    }, []);

    const groupHoldingsByAssetClass = (holdings) => {
        const grouped = {};
        holdings.forEach(holding => {
            if (!grouped[holding.asset_class]) {
                grouped[holding.asset_class] = [];
            }
            grouped[holding.asset_class].push(holding);
        });
        return grouped;
    };

    const toggleGroupExpansion = (assetClass) => {
        setExpandedGroups(prevState => ({
            ...prevState,
            [assetClass]: !prevState[assetClass],
        }));
    };

    const renderGroupedRows = () => {
        return Object.entries(groupedHoldings).map(([assetClass, holdings], index) => (
            <React.Fragment key={index}>
                <TableRow onClick={() => toggleGroupExpansion(assetClass)}>
                    <TableCell>
                        <IconButton className="circleButton" size="small" style={{ backgroundColor: 'rgb(26, 169, 241)' }}>
                            {expandedGroups[assetClass] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                    </TableCell>
                    <TableCell>
                        {`${assetClass} (${holdings.length})`} {/* Show total number of items */}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={2}>
                        <Collapse in={expandedGroups[assetClass]} timeout="auto" unmountOnExit>
                            <Box margin={1}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Ticker</TableCell>
                                            <TableCell>Asset Class</TableCell>
                                            <TableCell>Avg Price</TableCell>
                                            <TableCell>Market Price</TableCell>
                                            <TableCell>Latest Change (%)</TableCell>
                                            <TableCell>Market Value (Base CCY)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {holdings.map((holding, holdingIndex) => (
                                            <TableRow key={holdingIndex}>
                                                <TableCell>{holding.name}</TableCell>
                                                <TableCell>{holding.ticker}</TableCell>
                                                <TableCell>{holding.asset_class}</TableCell>
                                                <TableCell>{holding.avg_price}</TableCell>
                                                <TableCell>{holding.market_price}</TableCell>
                                                <TableCell>{holding.latest_chg_pct}</TableCell>
                                                <TableCell>{holding.market_value_ccy}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </React.Fragment>
        ));
    };
    

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableBody>
                    {renderGroupedRows()}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default HoldingsTable;
