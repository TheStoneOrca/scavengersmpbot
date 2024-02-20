import mongoose from "mongoose";

const SMPMemberSchema = new mongoose.Schema({
  memberid: String,
  membername: String,
  memberdescription: String,
  memberprofile: String,
});

const SMPModel = mongoose.model("smpmembers", SMPMemberSchema);

export default SMPModel;
