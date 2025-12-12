import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';


export default function InformedConsentModal(props) {

	const [isConsentGiven, setIsConsentGiven] = useState(false);

	const handleConsent = (e) => {
		props.consentCallback(isConsentGiven);
	}

	return (

		<Transition appear show={props.show} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={() => { }}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black bg-opacity-25" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
								<Dialog.Title
									as="h3"
									className="text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4"
								>
									Testing an Interactive Movie Recommender System Using
									Emotions for Diversification
								</Dialog.Title>
								<div className="mt-2 max-h-[60vh] overflow-y-auto pr-2">
									<p className='text-lg font-bold mb-2'>
										Key Information About the Research Study
									</p>
									<p className="mb-4">
										<span className='font-bold'>
											Voluntary Consent:&nbsp;
										</span>
										Dr. Bart Knijnenburg is inviting you to volunteer for a
										research study. Dr. Knijnenburg is an associate professor
										at Clemson University. He will conduct the study with Lijie
										and Mehtab (both graduate students at Clemson University).
									</p>

									<p className="mb-4">
										<span className='font-bold'>
											Alternative to Participation:&nbsp;
										</span>
										Participation is voluntary, and the only alternative is to
										not participate. You will not be punished in any way if you
										decide not to be in the study or to stop taking part in the
										study.
									</p>
									<p className="mb-4">
										If you decide not to take part or to stop taking part in
										this study, it will not affect you in any way.
									</p>

									<p className="mb-4">
										<span className='font-bold'>
											Study Purpose:&nbsp;
										</span>
										The purpose of this research is to evaluate a movie
										recommender system and better understand your
										experiences with the system through your responses to
										the post-task questionnaire.
									</p>

									<p className="mb-4">
										<span className='font-bold'>
											Activities and Procedures:&nbsp;
										</span>
										Your part in this study will be viewing some
										recommendations and completing a quick post-task survey.
										It will take you about 10-15 minutes to be in this study,
										but please make yourself available for 20 minutes just in
										case.
									</p>

									<p className="mb-4">
										<span className='font-bold'>
											Risks and Benefits:&nbsp;
										</span>
										We do not know of any risks or discomforts to you in this
										study. The only benefit to you is the learning experience
										from participating in a research study. The benefit to
										society is the contribution to scientific knowledge.
									</p>

									<p className='text-lg font-bold mb-2'>Incentives</p>
									<p className="mb-4">
										Participants who complete all tasks will be compensated
										with $2.40. Successful and careful completion of the tasks
										is a prerequisite for payment.
									</p>

									<p className='text-lg font-bold mb-2'>
										Audio/Video Recording and Photographs
									</p>
									<p className="mb-4">
										This session will not be audio/video recorded.
									</p>

									<p className='text-lg font-bold mb-2'>
										Protection of Privacy and Confidentiality
									</p>
									<p className="mb-4">
										No identifiable information will be collected during the study.
										The anonymous information collected in this study could be used
										for future research studies or distributed to another
										investigator for future research studies without additional
										informed consent from the participants or legally authorized
										representative.
									</p>
									<p className="mb-4">
										The results of this study may be published in scientific
										journals, professional publications, or educational
										presentations. Published results will not include
										identifiable information.
									</p>

									<p className='text-lg font-bold mb-2'>
										Contact Information
									</p>
									<p className="mb-4">
										If you have any questions or concerns about your rights in this research study,
										please contact the Clemson University Office of Research Compliance (ORC) at
										864-656-0636 or <a href="mailto:irb@clemson.edu" className="text-blue-600 hover:underline">irb@clemson.edu</a>. If you are
										outside of the Upstate South Carolina area, please use the ORC's toll-free number,
										866-297-3071. The Clemson IRB will not be able to answer some study-specific
										questions. However, you may contact the Clemson IRB if the research staff cannot
										be reached or if you wish to speak with someone other than the research staff.
									</p>
									<p className="mb-4">
										If you have any study related questions or if any problem arise, please contact
										Lijie <a href="mailto:lydiahsu7@gmail.com" className="text-blue-600 hover:underline">lydiahsu7@gmail.com</a>.
									</p>

									<p className='text-lg font-bold mb-2'>
										Consent
									</p>
									<p className='font-bold mb-4'>
										By participating in the study, you indicate that you have
										read the information written above, been allowed to ask any
										questions, and you are voluntarily choosing to take part in
										this research.
									</p>
									<div className="flex items-start mt-4">
										<input
											type="checkbox"
											id="consent-checkbox"
											className="mt-1 mr-2 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
											onChange={(evt) => setIsConsentGiven(evt.target.checked)}
										/>
										<label htmlFor="consent-checkbox" className="font-medium text-gray-700">
											I have read and understood this consent form and I agree to participate in this
											research study
										</label>
									</div>
								</div>

								<div className="mt-6 flex justify-end gap-4 border-t pt-4">
									<Link to="/quit">
										<button
											type="button"
											className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
										>
											Exit
										</button>
									</Link>
									<button
										type="button"
										className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${!isConsentGiven || props.isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500'}`}
										disabled={!isConsentGiven || props.isLoading}
										onClick={(e) => handleConsent(e)}
									>
										{!props.isLoading ? 'Continue'
											:
											<div className="flex items-center gap-2">
												<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
													<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
													<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
												</svg>
												Loading...
											</div>
										}
									</button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}