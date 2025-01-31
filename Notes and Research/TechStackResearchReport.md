# Tech Stack Research Report

This is our research report on the tech stack for our Project. It aims to give insight about how each one functions so we are able to decide which ones will best suite our project goals and requirements.

The following is our tech stack:
* AWS -> S3
* DynamoDB
* ECS/EC2
* AWS Glue
* EMR
* Lambda
* JavaScript, TS, NodeJS
* Angular, Vue, ReactJS, Node
* OCR (OPtical Character Recongition)

## AWS S3 (Simple Storage Service)

* Cloud Storage Service
* Known for security and scalability
* Able to handle theoretically unlimited amountsd of data, great for bigdata
* Can be integrated with other AWS services such as Lambda for automatic processing of recipts
* Concept of data lake - all computation, querying, etc. can be done in S3 using other services (Glue, Athena)
* Pay-as-you-go model. Allows growth as needed for the project

## DynamoDB

* Serverless, soSQL database system with fast database fucntionality and reliable security
    + Because it's serverless, any system using it isn't relying on an external server in order to function
* Used for building internet applications that can store user-generated content by the millions and handle heavy traffic
* More performant when querying through large amounts of data than other database systems
* Offers many different database types such as:
    + Key-value databases
    + search databases
    + document databases
        - allows for storing data as json objects
        - MongoDB compatability
* **Con**: uses key-value lookups to query for data which limits the user to how to make queries, unlike SQL which uses advanced commands 


## ECS/EC2

### ECS (Amazon Elastic Container Service)

*  Fully managed  container orchestration service allowing you to deploy, manage, and scale containerized applications
* Works by describing your application as well as its required resources, then ECS will launch, monitor, and scale your application with automatic integration into other AWS services needed for the application and project
* Operators create custom scaling and capacity rules, and observe and query telemetry and logs from running applications

### EC2 (Amazon Elastic Compute Cloud)

* Allows users to run applications on virtual servers, or in other words 'provides scalable computing capacity in the cloud'
* Enables users to scale resources up or down based on demand, making it cost efficient for workloads
* Commonly used for hosting web applications, data processing, ML models, and running enterprise applications
* Users have complete control over the virtual servers, including configuring the operating system, security settings, and networking features


## AWS Glue

* Fully managed ETL (Extract, Transform and Load) service that makes it easy to prepare and load data for analytics
* Automates the job of organizing, updating, and moving data between different databases
* Has a few features to aid in its functionality, like a metadata repository, automatic schema discovery, as well as code generation for data transformation
* Used for data integration, building data lakes, preparing data for machine learning, or preparing data for analytics


## EMR (Elastic MapReduce)

* Designed for processing large amounts of data using big data framworks like
    + Apache Hadoop
    + Apache Spark
    + Apache HBase
* Commonly used for data processing tasks such as
    + big data analytics
    + data warehousing
    + ETL (Extract, Transform, Load)
* Allows you to spin up clusters of EC2 instances that can be configured to run your jobs.
* Integrates with ither AWS services like S3 for storage.

## Lambda

* Serverless compute serves that lets you run code in response to events without provisioning or managing servers
* Ideal for:
    + building microservices
    + running backend processes
    + handling real-time data processing
    + responding to triggers from other AWS services
* Works by uploading code and defining triggers. Lambda automatically scales your application by running your code in response to events.
    + charges only for compute time used
* Integrates with other AWS services

## JavaScript, TS, NodeJS

### JavaScript

* A programming language used for client-side scripting for webpages.
* HTML, CSS, and JavaScript are considered the trinity for creating web pages.
* These scripts are used by the HTML documents to perform actions such as loading webpages, controlling playback streams, form validation, and storing and retrieving data on the user's system.
* Some **downsides** of JavaScript include being a dynamically-typed language, meaning that it takes time to check types at runtime.

### TS (TypeScript)

* A programming language that is a superset of JavaScript.
* A statically-typed language that can type-related errors before compiling.
* Supports definition files for JavaScript, as well as external libraries for  jQuery, MongoDB, and NodeJS.
* Can be used for larger-scale projects.
* Some **downsides** include a high learning curve to understand how to program with.

## Angular, Vue, ReactJS, Node

### Angular

* Frontend framework with built in features ex. routing, state management, and form handling.
* Ideal for large scale applications, single page applications, and dynamic web applications
* two way data binding synchronizes model and view for ease of UI updates
* Backed by google with many resources for troubleshooting
* component based architecture

### Vue

* Frontend framework that is progressive allowing for incrimental integration into projects
* reactive data binding wich is similar to Angular but is simpler to use
* single file component which combines HTML, CSS, and JavaScript into one file for better organization
* Often chosen where simplicity and ease of integration are important
* gentle learning curve
* easily integrated into existing applications
* ideal for dynamic UI

### ReactJS


* Frontend library
* component based promotes resuable UI components
* Ideal for applications that require a lot of user interaction and dynamic content, single page applications,  mobile applications, and content management systems
* backed by facebook with many resources and support
* Many different libraries and tools for customization
* Unidirectional data flow which simplifies data management and debugging

### Node

* backend runtime environment
* JavaScript runtime enables fullstack java development
* event driven architecture allows for efficient asynchronous operations
* Ideal for scalable network applications i.e APIs and real time application
* extensive library of packages for rapid development

## OCR (Optical Character Recognition)

* Primary function of OCR is to extract data from physical documents (in our case, receipts) into usable data
* Tool called Amazon Textract, that directly integrates into other tools we will use
