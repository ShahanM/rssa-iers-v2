import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';


export const InstructionModal = (props) => {

	return (
		<Transition appear show={props.show} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={props.onHide}>
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
							<Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
								<Dialog.Title
									as="h3"
									className="text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4"
								>
									Interacting with the system
								</Dialog.Title>
								<div className="mt-2">
									<div className="instructionsBlock" >
										<p className="font-bold mb-2">
											Please inspect the recommendations and adjust them to your preference.
										</p>
										<ol className="list-decimal pl-5 mb-4 space-y-2">
											<li>
												<p>
													We predict that you will like these 7 movies the best
													among the movies in our system based on your ratings
													on the movie rating step earlier.
												</p>
											</li>
											<li>
												<p>
													You can hover over movies to see a preview of the
													poster, a short synopsis, and the movie's emotional
													feature in 8 emotions: joy, trust, fear, surprise,
													sadness, disgust, anger, and anticipation.
												</p>
											</li>
											<li>
												<p>
													Please adjust the emotion strength indicators below
													so we can fine-tune the recommendations.
												</p>
											</li>
										</ol>
										<p className="font-bold">
											Continue adjusting the recommendations until they
											best fit your preferences and click the green Finalize button.
										</p>
									</div>
								</div>

								<div className="mt-6 flex justify-end">
									<button
										type="button"
										className="inline-flex justify-center rounded-md border border-transparent bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
										onClick={props.onHide}
									>
										Close
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
