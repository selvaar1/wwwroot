<!-- directives -->
<% @Page Language="C#" %>

<%

string toolexe = "C:/inetpub/wwwroot/Scheduler/Scheduler.exe";

System.Diagnostics.ProcessStartInfo psi = new System.Diagnostics.ProcessStartInfo(toolexe);
System.Diagnostics.Process p = System.Diagnostics.Process.Start(psi);

//Response.Write(Convert.ToString(p));

string log = "Scheduler_Log_"+DateTime.Now.ToString("dd-MM-yyyy")+".txt";

%>

<!-- Layout -->
<html>
   <head> 
      <title>Run Scheduler</title> 
   </head>
   
   <body>
   
   See log <a href="<%=log%>"><%=log%><a> (may take few minutes)
   
   </body>
   
</html>