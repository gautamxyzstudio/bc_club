"use client";
import CustomButton from "@/src/components/button/CustomButton";
import CustomDialog from "@/src/components/common/customDialog/CustomDialog";
import {
  DialogActions,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signup } from "@/src/api/auth/authApi";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import {
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import Link from "next/link";

interface SignupPopupProps {
  open: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onOpenAccCreation: () => void;
}

const SignupPopup = ({
  open,
  onClose,
  onOpenLogin,
  onOpenAccCreation,
}: SignupPopupProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuthContext();
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsViewed, setTermsViewed] = useState(false);
  const [acceptedVowTerms, setAcceptedVowTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setErrorMsg("");
      if (!acceptedVowTerms) {
        setErrorMsg("Please review and accept the VOW Terms of Use.");
        return;
      }
      const response = await signup({
        fullName: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
        role: "Admin",
        acceptedVowTerms: true,
        acceptedVowVersion: "2026-07",
      });
      if (response.message) {
        onOpenAccCreation();
        reset();
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/google-login`, 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken,
            acceptedVowTerms,
            acceptedVowVersion: "2026-07",
          }),
        },
      );

      const data = await res.json();

      if (data.message && !data.jwt) {
        toast.info(data.message); // "Please verify your email"
        return;
      }

      if (data.message && data.jwt) {
        localStorage.setItem("token", data.jwt);
        loginUser(data.user, data.jwt, true);
        onClose();
        toast.success("Login successful!");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.error("Google Login Failed:", error);
      setErrorMsg("Google Login Failed");
    }
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Create an Account"
      description="Fill the information for real estate updates"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}
        <div className="flex gap-4 mb-7.75">
          <TextField
            label="First Name"
            type="text"
            className="w-full "
            {...register("firstName", { required: "First Name is required" })}
            error={!!errors.firstName}
            helperText={errors.firstName?.message as string}
          />
          <TextField
            label="Last Name"
            type="text"
            className="w-full"
            {...register("lastName", { required: "Last Name is required" })}
            error={!!errors.lastName}
            helperText={errors.lastName?.message as string}
          />
        </div>
        {/* Email */}
        <TextField
          label="Email"
          type="email"
          className="w-full"
          {...register("email", { required: "Email is required" })}
          error={!!errors.email}
          helperText={errors.email?.message as string}
          sx={{
            "& .MuiOutlinedInput-input": {
              height: "auto",
              padding: 2,
            },
          }}
        />

        {/* Password */}
        <div className="relative mt-4">
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            className="w-full p-4"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                message:
                  "Password must include uppercase, lowercase, number, and special character",
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message as string}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </div>

        <div className="mt-5 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-700 mb-2">
            Please review the VOW Terms of Use before creating your account.
          </p>

          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="text-[#22558B] font-semibold text-sm underline"
          >
            View VOW Terms of Use
          </button>

          <FormControlLabel
            sx={{
              ml: 0,
              mt: 1,
              alignItems: "flex-start",
              display: "flex",
            }}
            control={
              <Checkbox
                checked={acceptedVowTerms}
                disabled={!termsViewed}
                onChange={(e) => setAcceptedVowTerms(e.target.checked)}
                sx={{
                  padding: 0,
                }}
              />
            }
            label={
              <span className="text-sm text-gray-700 ml-1">
                I have reviewed and agree to the VOW Terms of Use.
              </span>
            }
          />

          {!termsViewed && (
            <p className="text-xs text-red-500">
              Please open the VOW Terms before accepting.
            </p>
          )}
        </div>

        <CustomButton
          label={loading ? "Signing up..." : "Sign Up"}
          buttonType={!acceptedVowTerms || loading ? "disabled" : "primary"}
          customClasses="w-full mt-5"
          type="submit"
          disabled={loading || !acceptedVowTerms}
        />

        <div className="flex items-center gap-3 mt-5 mb-2.5">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-[#000F0D] text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>
        <div className="flex justify-center flex-col items-center gap-2 py-3 px-13 rounded-md">
          {!acceptedVowTerms ? (
            <button
              type="button"
              onClick={() => {
                setTermsOpen(true);
                toast.error(
                  "Please review and accept the VOW Terms before signing in with Google.",
                );
              }}
              className="border border-gray-300 rounded-full px-5 py-2 text-sm font-medium bg-white hover:bg-gray-50"
            >
              Sign up with Google
            </button>
          ) : (
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                const idToken = credentialResponse.credential;
                if (idToken) handleGoogleLogin(idToken);
              }}
              onError={() => {
                setErrorMsg("Google Login Failed");
              }}
              text="signup_with"
              shape="pill"
            />
          )}
        </div>

        <p className="text-center flex justify-center text-gray-600 text-sm mt-4 gap-1.5">
          Already have an account?
          <span
            onClick={onOpenLogin}
            className="text-yellow-500 font-medium hover:underline cursor-pointer"
          >
            Sign in
          </span>
        </p>
      </form>

      <Dialog
        open={termsOpen}
        onClose={() => {
          setTermsOpen(false);
          setAcceptedVowTerms(true);
          setTermsViewed(true);
        }}
        maxWidth="md"
        fullWidth
        sx={{
          scrollbarWidth: "none",
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "20px",
            fontWeight: 600,
          }}
        >
          VOW Terms of Use
        </DialogTitle>

        <DialogContent
          sx={{
            px: 5,
          }}
        >
          <div className="w-full space-y-10 text-sm">
            <Heading
              tagType="h1"
              type={IHeadingTypes.heading20}
              content="Terms & Conditions"
              customClasses="text-center"
            />
            <div className=" space-y-2  mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="1. Binding Agreement & Privacy Acceptance"
              />
              <div className="space-y-3">
                <p>
                  Welcome to{" "}
                  <a
                    href="/"
                    className="text-blue-600 underline"
                    target="_blank"
                  >
                    bcrealestatemarket.com
                  </a>{" "}
                  (the “Website” or “Platform”). By creating an account,
                  authenticating your credentials, or otherwise accessing or
                  using any part of this Website, its mapping systems, school
                  databases, parcel data, or historical listing systems, you
                  (the “Participant,” “Registrant,” or “User”) explicitly affirm
                  your acceptance of and agreement to these Terms of Use
                  ("Terms") and our Privacy Policy.
                </p>
                <p>
                  This agreement constitutes a legally binding contract
                  governing your interaction with the Platform. If you do not
                  agree entirely with these Terms, you must immediately stop
                  using the Platform and close your browser window. Continued
                  use constitutes absolute acceptance of these Terms and any
                  future revisions made by us.
                </p>
                <div className="ml-9 space-y-2">
                  <p>
                    <strong>
                      ⚠️ Critical Notice: No Financial Obligation or Agency
                      Created
                    </strong>
                  </p>
                  <p>
                    This Terms of Use agreement does not impose any financial
                    obligation on you, nor does it establish a formal real
                    estate brokerage client relationship or representation
                    agreement between you and the Platform operators. Any
                    agreement that creates a financial obligation or formal
                    client representation must be established completely
                    separately from these Terms, must be prominently labeled as
                    a separate contract, and cannot be accepted solely by a
                    standard website registration or mouse click.
                  </p>
                </div>
              </div>
            </div>

            <div className=" space-y-2  mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="2. Eligibility & Account Security"
              />

              <ul className="list-disc list-outside ml-9 space-y-1.5">
                <li>
                  <strong>Age of Majority:</strong> You must be at least 19
                  years old (the legal age of majority in British Columbia) to
                  register an account and access restricted market intelligence
                  data on this Platform
                </li>
                <li>
                  <strong>Credential Responsibility:</strong> If you are
                  provided with a username, password, or verification code to
                  access historical sold data or proprietary maps, you are
                  solely responsible for maintaining its absolute
                  confidentiality. You agree not to share your access
                  credentials with any third party.
                </li>
                <li>
                  <strong>Access Restriction:</strong> We reserve the absolute
                  right, at our sole discretion and without prior notice, to
                  restrict, suspend, or permanently terminate access to certain
                  areas or data layers of the Website for any user suspected of
                  violating these provisions.
                </li>
              </ul>
            </div>

            <div className=" space-y-2  mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="3. Strict Prohibitions Against Scraping & Data Manipulation"
              />
              <div className="space-y-3">
                <p>
                  This Platform provides a high-utility provincial property
                  intelligence engine. To safeguard our custom code, layout
                  design, compiled boundaries, and database investments, you are
                  strictly granted a limited, revocable, non-exclusive license
                  for personal, non-commercial use only.
                </p>
                <p>
                  You are explicitly and legally prohibited from performing, or
                  assisting others in performing, the following actions:
                </p>
                <ul className="list-disc list-outside ml-9 space-y-1.5">
                  <li>
                    <strong>Automated Data Extraction:</strong> You will not
                    scrape, crawl, spider, harvest, or extract data from{" "}
                    <a
                      href="/"
                      className="text-blue-600 underline"
                      target="_blank"
                    >
                      bcrealestatemarket.com
                    </a>
                    , whether manually or through automated software tools. The
                    prohibited uses expressly include "screen scraping,"
                    "database scraping," "data mining," or any other mechanism
                    intended to collect, store, re-organize, summarize, or
                    manipulate our property intelligence or listing information.
                  </li>
                  <li>
                    <strong>Systematic Redistribution:</strong> You will not,
                    directly or indirectly, display, post, disseminate,
                    distribute, publish, broadcast, transfer, sell, or
                    sublicense any part of the data, school catchment borders,
                    parcel metrics, or listing information to another
                    individual, entity, or public forum.
                  </li>
                  <li>
                    <strong>Commercial Exploitation:</strong> You may not use
                    any data obtained from this Platform to build secondary
                    databases, commercial valuation tools, or consumer real
                    estate search engines.
                  </li>
                </ul>
                <p>
                  <i>
                    Note: This restriction does not apply to authorized, secure
                    AI integrations, such as an approved Model Context Protocol
                    (MCP) server configuration deployed and certified explicitly
                    by the operators of{" "}
                    <a
                      href="/"
                      className="text-blue-600 underline"
                      target="_blank"
                    >
                      bcrealestatemarket.com
                    </a>{" "}
                    for your personal use.
                  </i>
                </p>
              </div>
            </div>

            <div className=" space-y-2  mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="4. Consent to Personal Information Collection & Board Auditing"
              />
              <div className="space-y-3">
                <p>
                  By registering an account to view protected real estate
                  tracking metrics or historical data, you provide your explicit
                  consent for the Platform operators to collect, use, and
                  securely process your personal information (including your
                  first and last name, phone number, and email address).
                </p>
                <ul className="list-disc list-outside ml-9">
                  <li>
                    <strong>Board Audits & Compliance:</strong> You expressly
                    acknowledge and consent to the fact that your registration
                    data and personal information may be shared securely with
                    regional real estate boards, as well as their legal
                    representatives, for auditing, monitoring, and legal
                    compliance verification purposes.
                  </li>
                  <li>
                    <strong>Platform Tracking:</strong> We utilize advanced
                    monitoring systems to evaluate API call frequencies and user
                    behavior to detect unauthorized commercial data scraping.
                  </li>
                </ul>
              </div>
            </div>

            <div className=" space-y-2  mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="5. General Disclaimers & Limitation of Liability"
              />
              <ul className="list-disc list-outside ml-9">
                <li>
                  <strong>General Information Only:</strong> All contents of
                  this Website—including historical trends, property boundaries,
                  and neighborhood analytics—are provided for general
                  information and consumer evaluation purposes only. They do not
                  constitute formal investment, legal, or professional real
                  estate advice.
                </li>
                <li>
                  <strong>No Warranties:</strong> This Website and all data
                  streams are provided strictly on an "as is" and "as available"
                  basis. No parties involved in the creation or maintenance of
                  this site guarantee the absolute accuracy, timeliness,
                  performance, completeness, or suitability of the content. You
                  acknowledge that data errors, lagging updates, or system
                  inaccuracies may exist.
                </li>
                <li>
                  <strong>Exclusion of Liability:</strong> Your use of any
                  information, maps, or analytics on this site is entirely at
                  your own risk. The platform owners and any contributing real
                  estate board or data provider hold zero liability for
                  financial choices, investment outcomes, or transactional
                  consequences arising from the use or performance of this
                  Website.
                </li>
              </ul>
            </div>

            <div className=" space-y-2  mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="6. MLS® VOW (Virtual Office Website) Terms of Use & Regional BC Board Disclaimers"
              />
              <div className="space-y-2">
                <p>
                  <strong>
                    A. Core Property Data Disclaimers & Territorial Scope
                  </strong>
                </p>
                <p>
                  The real estate listing data, historical market analytics, and
                  sold records displayed on this Virtual Office Website (MLS®
                  VOW) originate in part from the MLS® Systems and Reciprocity
                  programs of the participating real estate boards across
                  British Columbia and Canada.
                </p>
                <p>
                  By utilizing this Platform, you acknowledge that the data is
                  subject to the unique rules of cooperation, regulations, and
                  copyright protections of the respective regional jurisdiction
                  where the property is located, specifically:
                </p>
                <ul className="list-disc list-outside ml-9">
                  <li>
                    <strong>Greater Vancouver REALTORS® (GVR):</strong>{" "}
                    Governing data across the Greater Vancouver metropolitan
                    area.
                  </li>
                  <li>
                    <strong>
                      The Fraser Valley Real Estate Board (FVREB):
                    </strong>{" "}
                    Governing data across Surrey, North Delta, Langley,
                    Abbotsford, and surrounding areas.
                  </li>
                  <li>
                    <strong>
                      The Chilliwack and District Real Estate Board (CADREB):
                    </strong>{" "}
                    Governing data across Chilliwack and surrounding Fraser
                    Valley regional pockets.
                  </li>
                  <li>
                    <strong>
                      The Vancouver Island Real Estate Board (VIREB):
                    </strong>{" "}
                    Governing island-specific property data layers.
                  </li>
                </ul>
                <p>
                  Real estate listings held by participating brokerage firms are
                  uniquely marked with the MLS® Reciprocity logo or data tags,
                  which explicitly include the identity of the listing
                  brokerage.
                </p>
                <p className="lg:ml-15 ml-8">
                  <strong>Information Notice for Properties Shown:</strong> This
                  representation is based in whole or in part on data generated
                  by Greater Vancouver REALTORS®, the Fraser Valley Real Estate
                  Board, the Chilliwack and District Real Estate Board, the
                  Vancouver Island Real Estate Board, or the Canadian Real
                  Estate Association, which assume no responsibility for its
                  accuracy. This information is deemed highly reliable but is
                  not guaranteed accurate by those organizations or the platform
                  operators.
                </p>
              </div>

              <div className="space-y-2">
                <p>
                  <strong>
                    B. Mandatory Consumer Commitments & Restrictive Covenants
                  </strong>
                </p>
                <p>
                  By registering an account, verifying your email address, and
                  creating secure access credentials on this Platform, you (the
                  "Registrant") solemnly swear, acknowledge, and agree to the
                  following terms mandated by FVREB, GVR, CADREB, and VIREB:
                </p>
                <ol className="list-decimal list-outside ml-9">
                  <li>
                    <strong>Consumer Disclosures:</strong> You confirm that you
                    have received, read, and understand the Privacy Notice and
                    Consent brochure published by the British Columbia Real
                    Estate Association (BCREA) and the Disclosure of
                    Representation in Trading Services (DORTS) document
                    published by the BC Financial Services Authority (BCFSA).
                  </li>
                  <li>
                    <strong>Lawful Consumer Relationship:</strong> You
                    acknowledge that these Terms establish a lawful, regulatory
                    REALTOR® / Consumer relationship between you and the
                    platform operators, and not a binding client representation
                    agency agreement or financial obligation.
                  </li>
                  <li>
                    <strong>Bona Fide Real Estate Interest:</strong> You certify
                    that you possess an authentic, bona fide interest in the
                    personal purchase, sale, or lease of real estate of the type
                    being browsed or tracked on this Platform.
                  </li>
                  <li>
                    <strong>Absolute Prohibition on Data Exploitation:</strong>{" "}
                    You will not yourself, and will not permit, assist, or code
                    workflows for others to, directly or indirectly:
                    <ul className="list-disc list-outside lg:ml-15 ml-8">
                      <li>
                        Copy, redistribute, retransmit, reformat, disseminate,
                        publish, broadcast, transfer, sell, or sublicense any
                        part of the MLS® VOW Data, historic sold records, or
                        listing information to any other person, entity, or
                        public forum.
                      </li>
                      <li>
                        Engage in automated or programmatic "Scraping"
                        (including screen scraping and database scraping), "data
                        mining," or any other activity intended to collect,
                        store, re-organize, summarize, or manipulate any MLS®
                        VOW Data or any related property indices.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Validation of Board Intellectual Property:</strong>{" "}
                    You explicitly recognize and validate the respective
                    regional Real Estate Boards' absolute ownership of, and the
                    validity of the Boards' proprietary rights, database rights,
                    and copyrights in the MLS® VOW Data, MLS® Systems, and
                    listing compilations.
                  </li>
                  <li>
                    <strong>Explicit Board Authorization to Audit:</strong> You
                    expressly authorize the Fraser Valley Real Estate Board,
                    Greater Vancouver REALTORS®, the Chilliwack and District
                    Real Estate Board, and their duly authorized compliance
                    representatives to log into, monitor, and access this VOW
                    platform and the information you provide to the platform
                    operator for the strict purposes of verifying systemic
                    compliance, tracking listing display privileges, and
                    ensuring the structural enforcement of these Terms of Use,
                    board bylaws, and provincial laws.
                  </li>
                </ol>
              </div>
            </div>

            <div className=" space-y-2  mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="7. Intellectual Property, Trademarks, and Copyrights"
              />
              <ul className="list-disc list-outside ml-9">
                <li>
                  <strong>Platform IP:</strong> The entire contents of this
                  site—including custom text components, map interfaces,
                  graphics, brand layouts, data indexing frameworks, and backend
                  source code—belong strictly to the owners of
                  bcrealestatemarket.com and are guarded under intellectual
                  property and copyright laws. Copying, distributing, or
                  modifying this content for free or commercial gain is
                  fundamentally illegal.
                </li>
                <li>
                  <strong>CREA Trademarks:</strong> The trademarks REALTOR®,
                  REALTORS®, and the REALTOR® logo are controlled and owned by
                  REALTOR® Canada Inc. and licensed exclusively to The Canadian
                  Real Estate Association (CREA). These marks pinpoint real
                  estate professionals who are active members of CREA and adhere
                  to its rigorous Code of Ethics. The terms Multiple Listing
                  Service®, MLS®, and their associated logos are owned by CREA
                  and denote the quality of professional real estate services
                  provided under license.
                </li>
              </ul>
            </div>

            <div className="space-y-2 mb-6">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="8. Dispute Resolution, Governing Law, and Open Data Acknowledgements"
              />
              <ul className="list-disc list-inside ml-4">
                <li>
                  <strong>Governing Law:</strong> This agreement, its
                  interpretation, and any technical or legal friction arising
                  from the Platform are governed strictly by the federal laws of
                  Canada and the provincial laws of British Columbia.
                </li>
                <li>
                  <strong>Binding Arbitration:</strong> Any dispute that cannot
                  be sorted out through amicable discussion shall be resolved
                  exclusively through final and binding arbitration in the City
                  of Vancouver, BC, under the provincial Arbitration Act.
                </li>
                <li>
                  <strong>Open Government Licensing:</strong> To build our
                  extensive property intelligence framework, this site safely
                  integrates public datasets licensed under the Open Government
                  Licence – British Columbia, as well as localized municipal and
                  regional open data frameworks courtesy of the following
                  jurisdictions:
                </li>
              </ul>
              <p>
                <strong>Integrated Municipal & Regional Data Registries</strong>
              </p>
              <ul className="grid grid-cols-2 list-disc list-outside ml-4">
                <li>City of Surrey</li>
                <li>City of Vancouver</li>
                <li>Township of Langley</li>
                <li>Sunshine Valley</li>
                <li>City of Abbotsford</li>
                <li>City of Burnaby</li>
                <li>City of Delta</li>
                <li>City of Chilliwack</li>
                <li>City of Kelowna</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Heading
                tagType="h2"
                type={IHeadingTypes.heading16}
                content="9. Regulatory Disclosure & Corporate Operator Identity"
              />
              <div className="space-y-2">
                <p>
                  This real estate property intelligence platform, located at{" "}
                  <a
                    href="/"
                    className="text-blue-600 underline"
                    target="_blank"
                  >
                    bcrealestatemarket.com
                  </a>{" "}
                  , is proudly presented, maintained, and operated exclusively
                  by:
                </p>
                <p>
                  <strong>
                    Harjit Sidhu Personal Real Estate Corporation (PREC)
                  </strong>
                </p>
                <p>
                  Representing <strong>The Sidhu Team</strong> at{" "}
                  <strong>Planet Group Realty Inc.</strong>
                </p>
                <p>
                  <i>Office Location: Surrey, British Columbia, Canada</i>
                </p>
                <p>
                  In accordance with British Columbia real estate advertising
                  regulations and licensing rules, the Participant acknowledges
                  that by using this VOW (Virtual Office Website) platform, they
                  are interacting with services overseen by the licensed
                  brokerages and professionals identified above.
                </p>
                <p>
                  All communications, data inquiries, opt-out requests for
                  matched-audience marketing, or licensing questions regarding
                  our custom mapping and automated features must be processed
                  directly through our Surrey administration team. Unauthorized
                  use of this website or its contents may give rise to a
                  substantial claim for monetary damages and/or be treated as a
                  legal offense enforceable by local and federal jurisdictions.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions
          sx={{
            px: 5,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTermsOpen(false);
              setTermsViewed(true);
              setAcceptedVowTerms(true);
            }}
            className="my-2 w-full bg-[#22558B] text-white py-3 rounded-md font-semibold self-center sticky bottom-0"
          >
            I Have Reviewed the Terms
          </button>
        </DialogActions>
      </Dialog>
    </CustomDialog>
  );
};

export default SignupPopup;
