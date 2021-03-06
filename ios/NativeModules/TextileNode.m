//  Created by react-native-create-bridge

#import "TextileNode.h"
#import "Events.h"
#import <Mobile/Mobile.h>

// import RCTBridge
#if __has_include(<React/RCTBridge.h>)
#import <React/RCTBridge.h>
#elif __has_include(“RCTBridge.h”)
#import “RCTBridge.h”
#else
#import “React/RCTBridge.h” // Required when used as a Pod in a Swift project
#endif

@interface Messenger : NSObject<MobileMessenger>
// Define class properties here with @property
@end

@interface Messenger()

@end

@implementation Messenger

- (void) notify: (MobileEvent *)event {
  [Events emitEventWithName:event.name andPayload:event.payload];
}

@end

@interface TextileNode()

@property (nonatomic, strong) MobileWrapper *node;

@end

@implementation TextileNode

// Export a native module
// https://facebook.github.io/react-native/docs/native-modules-ios.html
RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_queue_create("io.textile.TextileNodeQueue", DISPATCH_QUEUE_SERIAL);
}

// Export methods to a native module
// https://facebook.github.io/react-native/docs/native-modules-ios.html

RCT_EXPORT_METHOD(createNodeWithDataDir:(NSString *)dataDir apiUrl:(NSString *)apiUrl logLevel:(NSString *)logLevel logFiles:(BOOL *)logFiles resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error;
  [self _createNodeWithDataDir:dataDir apiUrl:apiUrl logLevel:logLevel logFiles:logFiles error:&error];
  if (self.node) {
    resolve(@YES);
  } else {
    reject(@(error.code).stringValue, error.localizedDescription, error);
  }
}

RCT_REMAP_METHOD(startNode, startNodeWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error;
  BOOL success = [self _startNode:&error];
  if(success) {
    resolve(@YES);
  } else {
    reject(@(error.code).stringValue, error.localizedDescription, error);
  }
}

RCT_REMAP_METHOD(stopNode, stopNodeWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error;
  BOOL success = [self _stopNode:&error];
  if(success) {
    resolve(@YES);
  } else {
    reject(@(error.code).stringValue, error.localizedDescription, error);
  }
}

RCT_EXPORT_METHOD(updateThread:(NSString *)mnemonic name:(NSString *)name resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error;
  [self _updateThread:mnemonic name:name error:&error];
  if(!error) {
    resolve(@YES);
  } else {
    reject(@(error.code).stringValue, error.localizedDescription, error);
  }
}

RCT_EXPORT_METHOD(addImageAtPath:(NSString *)path thumbPath:(NSString *)thumbPath thread:(NSString *)thread resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error;
  NetMultipartRequest *multipart = [self _addPhoto:path thumbPath:thumbPath toThread:thread error:&error];
  if(multipart) {
    resolve(@{ @"payloadPath": multipart.payloadPath, @"boundary": multipart.boundary });
  } else {
    reject(@(error.code).stringValue, error.localizedDescription, error);
  }
}

RCT_EXPORT_METHOD(sharePhoto:(NSString *)hash thread:(NSString *)thread caption:(NSString *)caption resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error;
  NetMultipartRequest *multipart = [self _sharePhoto:hash toThread:thread withCaption:caption error:&error];
  if(multipart) {
    resolve(@{ @"payloadPath": multipart.payloadPath, @"boundary": multipart.boundary });
  } else {
    reject(@(error.code).stringValue, error.localizedDescription, error);
  }
}

RCT_EXPORT_METHOD(getPhotos:(NSString *)offset limit:(int)limit thread:(NSString *)thread resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error;
  NSString *hashesString = [self _getPhotosFromOffset:offset withLimit:limit fromThread:thread error:&error];
  NSData *data = [hashesString dataUsingEncoding:NSUTF8StringEncoding];
  id json = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
  NSArray *hashes = [json objectForKey:@"hashes"];
  if (hashes) {
    resolve(hashes);
  } else {
    reject(@(error.code).stringValue, error.localizedDescription, error);
  }
}

RCT_EXPORT_METHOD(getHashRequest:(NSString *)hash resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error;
  NSString *request = [self _getHashRequest:hash error:&error];
  NSData *data = [request dataUsingEncoding:NSUTF8StringEncoding];
  id json = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
  NSString *token = [json objectForKey:@"token"];
  NSString *protocol = [json objectForKey:@"protocol"];
  NSString *host = [json objectForKey:@"host"];

  if (!error) {
    resolve(@{ @"host": host, @"protocol": protocol, @"token": token });
  } else {
    reject(@(error.code).stringValue, error.localizedDescription, error);
  }
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(syncGetHashData:(NSString *)path) {
  NSError *error;
  NSString *result = [self _getHashData:path error:&error];
  if (!error && result) {
    return result;
  } else {
    return nil;
  }
}

RCT_EXPORT_METHOD(getHashData:(NSString *)path resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error;
  NSString *result = [self _getHashData:path error:&error];
  if (result) {
    resolve(result);
  } else {
    reject(@(error.code).stringValue, error.localizedDescription, error);
  }
}

RCT_EXPORT_METHOD(pairNewDevice:(NSString *)pkb64 resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  NSError *error;
  NSString *result = [self _pairNewDevice:pkb64 error:&error];
  if(result) {
    resolve(result);
  } else {
    reject(@(error.code).stringValue, error.localizedDescription, error);
  }
}

RCT_EXPORT_METHOD(signIn:(NSString *)username password:(NSString *)password resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error;
  [self _signIn:username password:password error:&error];
  if (error == NULL) {
    resolve(@YES);
  } else {
    reject(@(error.code).stringValue, error.localizedDescription, error);
  }
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(isSignedIn) {
  BOOL signedIn = [self _isSignedIn];
  if (signedIn) {
    return @YES;
  } else {
    return @NO;
  }
}

RCT_EXPORT_METHOD(getUserName:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error;
  NSString *username = [self _getUsername:&error];
  if (username) {
    resolve(username);
  } else {
    reject(@(error.code).stringValue, error.localizedDescription, error);
  }
}

RCT_EXPORT_METHOD(getAccessToken:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error;
  NSString *token = [self _getAccessToken:&error];
  if (token) {
    resolve(token);
  } else {
    reject(@(error.code).stringValue, error.localizedDescription, error);
  }
}

RCT_EXPORT_METHOD(signOut:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error;
  [self _signOut:&error];
  if (error == NULL) {
    resolve(@YES);
  } else {
    reject(@(error.code).stringValue, error.localizedDescription, error);
  }
}

RCT_EXPORT_METHOD(signUpWithEmail:(NSString *)username password:(NSString *)password email:(NSString*)email referral:(NSString*)referral resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error;
  [self _signUpWithEmail:username password:password email:email referral:referral error:&error];
  if (error == NULL) {
    resolve(@YES);
  } else {
    reject(@(error.code).stringValue, error.localizedDescription, error);
  }
}

#pragma mark - Private methods

- (void)_createNodeWithDataDir:(NSString *)dataDir apiUrl:(NSString *)apiUrl logLevel:(NSString *)logLevel logFiles:(BOOL *)logFiles error:(NSError**)error {
  if (!self.node) {
    MobileNodeConfig *config = [[MobileNodeConfig alloc] init];
    [config setRepoPath:dataDir];
    [config setCentralApiURL:apiUrl];
    [config setLogLevel:logLevel];
    [config setLogFiles:logFiles];
    self.node = [[MobileMobile new] newNode:config messenger:[[Messenger alloc] init] error:error];
  }
}

- (BOOL)_startNode:(NSError**)error {
  BOOL startNodeSuccess = [self.node start:error];
  return startNodeSuccess;
}

- (BOOL)_stopNode:(NSError**)error {
  BOOL success = [self.node stop:error];
  return success;
}

- (NetMultipartRequest *)_addPhoto:(NSString *)path thumbPath:(NSString *)thumbPath toThread:(NSString *)thread error:(NSError**)error {
  NetMultipartRequest *multipart = [self.node addPhoto:path thumb:thumbPath thread:thread error:error];
  return multipart;
}

- (NetMultipartRequest *)_sharePhoto:(NSString *)hash toThread:(NSString *)thread withCaption:(NSString *)caption error:(NSError**)error {
  NetMultipartRequest *multipart = [self.node sharePhoto:hash thread:thread caption:caption error:error];
  return multipart;
}

- (NSString *)_getPhotosFromOffset:(NSString *)offset withLimit:(long)limit fromThread:(NSString *)thread error:(NSError**)error {
  NSString *hashesString = [self.node getPhotos:offset limit:limit thread:thread error:error];
  return hashesString;
}

- (NSString *)_getHashRequest:(NSString *)hash error:(NSError**)error {
  NSString *token = [self.node getHashRequest:hash error:error];
  return token;
}

- (NSString *)_getHashData:(NSString *)hashPath error:(NSError**)error {
  NSString *base64String = [self.node getFileBase64:hashPath error:error];
  return base64String;
}

- (NSString *)_pairNewDevice:(NSString *)pkb64 error:(NSError**)error {
  NSString *resultString = [self.node pairDesktop:pkb64 error:error];
  return resultString;
}

- (void)_signUpWithEmail:(NSString *)username password:(NSString*)password email:(NSString*)email referral:(NSString*)referral error:(NSError**)error {
  [self.node signUpWithEmail:username password:password email:email referral:referral error:error];
}

- (void)_signIn:(NSString *)username password:(NSString*)password error:(NSError**)error {
  [self.node signIn:username password:password error:error];
}

- (BOOL)_isSignedIn {
  return [self.node isSignedIn];
}

- (void)_signOut:(NSError**)error {
  [self.node signOut:error];
}

- (void)_updateThread:(NSString *)mnemonic name:(NSString*)name error:(NSError**)error {
  [self.node updateThread:mnemonic name:name error:error];
}

- (NSString *)_getUsername:(NSError**)error {
  return [self.node getUsername:error];
}

- (NSString *)_getAccessToken:(NSError**)error {
  return [self.node getAccessToken:error];
}

@end

@implementation RCTBridge (TextileNode)

- (TextileNode *)textileNode
{
  return [self moduleForClass:[TextileNode class]];
}

@end
