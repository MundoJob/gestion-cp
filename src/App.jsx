import { useEffect, useState } from "react";
import "./App.css";
import Layout from "./pages/Layout";

function App(data) {
  const module = data.data.Entity;
  const registerID = data.data.EntityId;
  const [datos, setDatos] = useState([]);

  function getRecord(module, registerID) {
    console.log("llamada GetRecord");

    var record = new Promise(function (resolve, reject) {
      window.ZOHO.CRM.API.getRecord({ Entity: module, RecordID: registerID })
        .then(function (e) {
          var register = e.data[0];
          // var numberID = id[0];
          resolve({ register: register });
        })
        .catch(function (error) {
          reject(error);
        });
    });
    return record;
  }

  useEffect(() => {
    //ACTIVAR PARA VER EL WIDGET EN WILDSCREEN
    console.log("llamada Rezise");
    window.ZOHO.CRM.UI.Resize({ height: "100%", width: "100%" }).then(function (
      data
    ) {});

    getRecord(module, registerID)
      .then(function (result) {
        const datos = result.register;
        setDatos(datos);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, [module, registerID]);

  return (
    <div className="App ">
      <Layout module={module} registerID={registerID} datos={datos} />
    </div>
  );
}

export default App;
