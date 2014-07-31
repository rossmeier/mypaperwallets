//var wallets = new Array({address:"1PihKgUGTFnZ4cvETDfCYYuxrHsYSaSBF2"}, {address:"19h6rD8xZpCKge86D2ZKQTvfjM7eS381Ab"});
var wallets = new Array();
var currencyCode = "EUR";
var currencySign = "€";
var currencyList = 0;
var currencyRate = 0;

function createXMLHttpRequest() {
	if(window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		return new XMLHttpRequest();
	} else {
		alert("Fatal Error, Get a new Browser");
	}
}

function updateList()
{
	$.each(wallets, function(i, val)
	{
		executeUpdate(i, val);
	});
	var html = "";
	var sum = 0.0;
	$.each(wallets, function(i, val)
	{
		if(typeof(val) == "undefined" || val == null)
			return;
		html += "<tr>";
			html += "<td>" + (("name" in val) ? val["name"] : "/") + "</td>";
			html += "<td><code>" + (("address" in val) ? val["address"] : "/") + "</code></td>";
			html += "<td><code>" + (("amount" in val) ? val["amount"] : "0") + " BTC" + "</code></td>";
			html += "<td><code>" + btcToCurrency(("amount" in val) ? val["amount"] : 0) + " " + currencySign + "</code></td>";
			html += "<td><button onclick=\"deleteWallet(" + i + ");\" class=\"btn red\">X</button>"
		html += "</tr>";
		sum += ("amount" in val) ? val["amount"] : 0;
	});
	html += "<tr><td></td><td>Sum</td><td><code>" + sum + " BTC</code></td><td><code>" + btcToCurrency(sum) + " " + currencySign + "</code></td>";
	$("tbody").html(html);
	if(localStorage)
		localStorage.setItem("wallets", JSON.stringify(wallets));
}

function deleteWallet(i)
{
	wallets.splice(i, 1);
	updateList();
}

function btcToCurrency(btc)
{
	return (Math.round(btc * currencyRate * 100) / 100).toFixed(2);
}

function updateCurrency()
{
	// $.get("http://blockchain.info/ticker", function(data){
		// alert(data);
	// });
	$.ajax({
		url: "https://bitpay.com/api/rates",
		//url: "https://ventos.sculptor.uberspace.de/test.txt",
		async: false,
		dataType: "text",
		error: function(xhr, status, error) {
			if(xhr.statusCode > 0)
				alert("Sorry, but I had a problem while getting the current exchange values from Bitpay; errorcode:" + xhr.statusCode);
			else
				alert("Fatal Error while getting the current exchange values from Bitpay (maybe connection problem)");
		},
		success: function(result){
			currencyList = JSON.parse(result);
		}
	});
	$.each(currencyList, function(i, val){
		if(val["code"] == currencyCode)
		{
			currencyRate = val["rate"];
		}
	});
	// var request2 = createXMLHttpRequest();
	// request2.onreadystatechange = function() {
		//alert("x");
		// if((request2.readyState == 4) && (request2.status == 200))
		// {
			// var doc = request2.responseText;
			// alert(doc);
			// delete request2;
		// }
		// else if((request2.readyState == 4) && (request2.status != 200))
		// {
			// alert("Error2");
			// delete request2;
		// }
	// }
	// request2.open("GET", "https://bitpay.com/api/rates", false);
	//request2.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	// request2.send("");
	//var currencyList = 1.0 / parseFloat($("iframe").contents());
}

function executeUpdate(i, val)
{
	if(typeof(val)=="undefined" || val == null)
		return;
		
	$.ajax({
		url: "https://blockchain.info/q/addressbalance/" + val["address"],
		async: false,
		error: function(xhr, status, error) {
			if(xhr.statusCode > 0)
				alert("Sorry, but I had a problem while getting the address balance; errorcode:" + xhr.statusCode);
			else
				alert("Fatal Error while getting the address balance (maybe connection problem)");
		},
		success: function(result){
			wallets[i]["amount"] = parseFloat(result) / 1e8 ;
			//alert("Balance for " + wallets[i]["address"] + ": " + wallets[i]["amount"] + " BTC");
		}
	});
}



$(document).ready(function(){
	if(localStorage && localStorage.getItem("wallets") != null)
		wallets = JSON.parse(localStorage.getItem("wallets"));
	$("button#add").click(function(){
		wallets.push({name: $("input#name").val(), address: $("input#address").val()});
		$("input#name").val("");
		$("input#address").val("");
		updateList();
	});
	setInterval(function(){
		updateCurrency();
	}, 1000 * 60 * 60);
	setInterval(function(){
		updateList();
	}, 1000 * 60 * 5);
	updateCurrency();
	updateList(); 
});