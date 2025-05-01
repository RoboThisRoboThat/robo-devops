import getInstancesService from "./service/EC2/getInstances.service";

const instances = await getInstancesService.getInstances({
	region: "ap-south-1",
	filters: [
		{
			Name: "tag:maintainer",
			Values: ["sourav.das@masaischool.com"],
		},
	],
});

console.log(instances);
