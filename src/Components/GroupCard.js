import React, { useState, useEffect } from "react";
import axios from "axios";
import DisplaySVG from '../Assets/icons_FEtask/Display.svg';
import AddSVG from '../Assets/icons_FEtask/add.svg';
import BacklogSVG from '../Assets/icons_FEtask/Backlog.svg';
import CancelledSVG from '../Assets/icons_FEtask/Cancelled.svg';
import DoneSVG from '../Assets/icons_FEtask/Done.svg';
import InProgressSVG from '../Assets/icons_FEtask/in-progress.svg';
import HighPrioritySVG from '../Assets/icons_FEtask/Img - High Priority.svg';
import LowPrioritySVG from '../Assets/icons_FEtask/Img - Low Priority.svg';
import MediumPrioritySVG from '../Assets/icons_FEtask/Img - Medium Priority.svg';
import UrgentPriorityColorSVG from '../Assets/icons_FEtask/SVG - Urgent Priority colour.svg';
import UrgentPriorityGreySVG from '../Assets/icons_FEtask/SVG - Urgent Priority grey.svg';
import ToDoSVG from '../Assets/icons_FEtask/To-do.svg';
import Threedot from '../Assets/icons_FEtask/3 dot menu.svg';

const GroupCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tickets, setTickets] = useState({}); // State for tickets grouped by selected criteria
  const [data, setData] = useState({}); // State for the fetched data
  const [groupBy, setGroupBy] = useState("status"); // State for the grouping criterion
  const [orderBy, setOrderBy] = useState("Priority"); // State for ordering
  const [userColorMapping, setUserColorMapping] = useState({}); // State for user color mapping

  const statusCategories = [
    { name: "Backlog", icon: BacklogSVG },
    { name: "Todo", icon: ToDoSVG },
    { name: "In progress", icon: InProgressSVG },
    { name: "Done", icon: DoneSVG },
    { name: "Cancelled", icon: CancelledSVG },
  ];

  const priorityMapping = {
    4: { label: "Urgent", icon: UrgentPriorityColorSVG },
    3: { label: "High", icon: HighPrioritySVG },
    2: { label: "Medium", icon: MediumPrioritySVG },
    1: { label: "Low", icon: LowPrioritySVG },
    0: { label: "No priority", icon: UrgentPriorityGreySVG },
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("https://api.quicksell.co/v1/internal/frontend-assignment");
        setData(res.data);

        if (res.data.users) {
          const colorMapping = {};
          res.data.users.forEach(user => {
            colorMapping[user.id] = getRandomColor();
          });
          setUserColorMapping(colorMapping);
        }

        setTickets(groupTickets("status", res.data.tickets || {}));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const groupTickets = (selectedGroup, ticketsData) => {
    const ticketsArray = Object.values(ticketsData);
    return ticketsArray.reduce((acc, ticket) => {
      const groupValue = selectedGroup === "priority" 
        ? ticket.priority 
        : selectedGroup === "userId"
        ? ticket.userId 
        : ticket.status;

      if (!acc[groupValue]) {
        acc[groupValue] = [];
      }
      acc[groupValue].push(ticket);
      return acc;
    }, {});
  };

  const handleGroupChange = (event) => {
    const selectedGroup = event.target.value;
    setGroupBy(selectedGroup);
    setTickets(groupTickets(selectedGroup, data.tickets || {})); 
  };

  const handleOrderChange = (event) => {
    setOrderBy(event.target.value);
  };

  const renderTickets = (ticketGroup) => (
    <>
      {ticketGroup.map((ticket) => (
        <div key={ticket.id} className="ticket">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div><p style={{ color: "gray", margin: "0" }}>{ticket.id}</p></div>
            {groupBy !== "userId" && 
              <div
                className="profile-circle"
                style={{
                  backgroundColor: userColorMapping[ticket.userId] || '#500042', 
                }}
              >
                {data.users && ticket.userId
                  ? data.users.find(user => user.id === ticket.userId).name.slice(0, 2).toUpperCase()
                  : ""}
              </div>
            }
          </div>
          <p style={{ color: "black", margin: "0"}}>
            {groupBy !== "status" && <img src={statusCategories[ticket.priority]?.icon} alt={priorityMapping[ticket.priority]?.label} style={{ marginRight: '5px' }} />}
            {ticket.title}
          </p>
          
          {ticket.tag && (
            <span style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
              {groupBy !== "priority" && <img src={priorityMapping[ticket.priority]?.icon} alt={priorityMapping[ticket.priority]?.label} style={{ marginRight: '5px' }} />}
              <span
                style={{
                  backgroundColor: "#f0f0f0",
                  borderRadius: "50%",
                  width: "8px",
                  height: "8px",
                  margin: "0 5px",
                  display: "inline-block",
                }}
              ></span>
              {ticket.tag}
            </span>
          )}
        </div>
      ))}
    </>
  );

  return (
    <div>
      <div>
      <div>
          <button className="filter-btn" onClick={() => setIsOpen(!isOpen)}>
            <img src={DisplaySVG} alt="Display" style={{marginRight:'4px'}} />
             Display
          </button>
        </div>


        {isOpen && (
          <div className="filter-container">
            <table className="filter-table">
              <tbody>
                <tr>
                  <td>
                    <label htmlFor="group" className="label">Grouping</label>
                  </td>
                  <td>
                    <select id="group" name="Group" onChange={handleGroupChange} className="select">
                      <option value="status">Status</option>
                      <option value="userId">User</option>
                      <option value="priority">Priority</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="arrange" className="label">Ordering</label>
                  </td>
                  <td>
                    <select id="arrange" name="Arrange" onChange={handleOrderChange} className="select">
                      <option value="Priority">Priority</option>
                      <option value="Title">Title</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {groupBy === "status" && statusCategories.map(({ name, icon }) => (
            <div key={name} style={{ flex: "1", padding: "10px", position: "relative" }}>
              <p style={{ display: "flex", alignItems: "center" }}>
                <img src={icon} alt={name} style={{ marginRight: '5px' }} />
                {name}
                <span style={{ color: "gray", marginLeft: "10px" }}>
                  {tickets[name] ? tickets[name].length : 0}
                </span>
                <img src={AddSVG} alt="Add" style={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={() => console.log(`Add ticket to ${name}`)} />
                <img src={Threedot} alt="Options" style={{ marginLeft: '5px', cursor: 'pointer' }} onClick={() => console.log(`Options for ${name}`)} />
              </p>
              <div>{tickets[name] && renderTickets(tickets[name])}</div>
            </div>
          ))}

          {groupBy === "userId" && Object.keys(tickets).map((userId) => (
            <div key={userId} style={{ flex: "1", padding: "10px", position: "relative" }}>
              <p style={{ display: "flex", alignItems: "center" }}>
                <div
                  className="profile-circle"
                  style={{
                    backgroundColor: userColorMapping[userId] || '#500042',
                  }}
                >
                  {data.users && userId
                    ? data.users.find(user => user.id === userId).name.slice(0, 2).toUpperCase()
                    : ""}
                </div>
                {data.users && userId ? data.users.find(user => user.id === userId).name : "Unknown User"}
                <span style={{ color: "gray", marginLeft: "10px" }}>
                  {tickets[userId] ? tickets[userId].length : 0}
                </span>
                <img src={AddSVG} alt="Add" style={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={() => console.log(`Add ticket for ${userId}`)} />
                <img src={Threedot} alt="Options" style={{ marginLeft: '5px', cursor: 'pointer' }} onClick={() => console.log(`Options for ${userId}`)} />
              </p>
              <div>{tickets[userId] && renderTickets(tickets[userId])}</div>
            </div>
          ))}

          {groupBy === "priority" && Object.keys(tickets).map((priority) => (
            <div key={priority} style={{ flex: "1", padding: "10px", position: "relative" }}>
              <p style={{ display: "flex", alignItems: "center" }}>
                <img src={priorityMapping[priority]?.icon} alt={priorityMapping[priority]?.label} style={{ marginRight: '5px' }} />
                {priorityMapping[priority]?.label}
                <span style={{ color: "gray", marginLeft: "10px" }}>
                  {tickets[priority] ? tickets[priority].length : 0}
                </span>
                <img src={AddSVG} alt="Add" style={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={() => console.log(`Add ticket with ${priorityMapping[priority]?.label} priority`)} />
                <img src={Threedot} alt="Options" style={{ marginLeft: '5px', cursor: 'pointer' }} onClick={() => console.log(`Options for ${priorityMapping[priority]?.label} priority`)} />
              </p>
              <div>{tickets[priority] && renderTickets(tickets[priority])}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
